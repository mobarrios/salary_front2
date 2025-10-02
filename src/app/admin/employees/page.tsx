'use client';

import { Params } from '@/types/params';
import { name } from './model';
import Link from 'next/link';
import ModalButton from '@/components/Modal/NewFormModal';
import FormEmployees from './form/page';
import Breadcrumb from '@/components/BreadCrumb';
import PrimeDataTable from '@/components/DataTable';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { fetchData } from '@/server/services/core/fetchData';

type Emp = {
  id: number | string;
  name: string;
  associate_id: string;
  teams?: { name?: string } | null;
  actual_external_data?: {
    home_department_description?: string;
    job_title_description?: string;
    business_unit_code?: string;
  } | null;
};

export default function Employees({ searchParams }: Params) {
  const { search } = searchParams;

  const { data: session } = useSession();
  const roles: string[] = session?.user?.roles?.map((r: any) => r.name) || [];
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Dataset completo en memoria
  const [allResults, setAllResults] = useState<Emp[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Búsqueda (cliente)
  const [searchTerm, setSearchTerm] = useState<string>(search || '');

  // Control de carreras: “última respuesta gana”
  const requestIdRef = useRef(0);

  useEffect(() => {
    setIsAdmin(roles.some((role) => ['superuser', 'administrator'].includes(role)));
  }, [roles]);

  // Normalizador simple para búsqueda
  const norm = (s: any) =>
    String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

  // Filtro en cliente
  const filtered = useMemo(() => {
    if (!searchTerm) return allResults;
    const q = norm(searchTerm);
    return allResults.filter((e) => {
      return (
        norm(e.name).includes(q) ||
        norm(e.associate_id).includes(q) ||
        norm(e.actual_external_data?.home_department_description).includes(q) ||
        norm(e.actual_external_data?.job_title_description).includes(q) ||
        norm(e.actual_external_data?.business_unit_code).includes(q) ||
        norm(e.teams?.name).includes(q)
      );
    });
  }, [allResults, searchTerm]);

  // Traer TODO del backend en batches, sin filtrar ni ordenar en server
  const loadAll = useCallback(async () => {
    const token = session?.user?.token;
    if (!token) return;

    const myId = ++requestIdRef.current;
    setLoading(true);
    setErrorMsg(null);

    try {
      const BATCH = 1000; // ajustá si necesitás
      let skip = 0;
      const acc: Emp[] = [];
      let expectedCount: number | null = null;

      // dedupe defensivo por id
      const seen = new Set<string | number>();

      while (true) {
        const url = `${name}/all/?skip=${skip}&limit=${BATCH}`;
        const res = await fetchData(token, 'GET', url);

        if (myId !== requestIdRef.current) return; // respuesta vieja

        const data: Emp[] = Array.isArray(res?.data) ? res.data : [];
        if (expectedCount == null) expectedCount = Number(res?.count ?? data.length) || 0;

        for (const row of data) {
          if (!seen.has(row.id)) {
            seen.add(row.id);
            acc.push(row);
          }
        }

        skip += BATCH;
        if (data.length < BATCH || acc.length >= expectedCount) break;
      }

      setAllResults(acc);
    } catch (err: any) {
      if (myId === requestIdRef.current) {
        setErrorMsg('No se pudo cargar la lista completa.');
        console.error(err);
      }
    } finally {
      if (myId === requestIdRef.current) setLoading(false);
    }
  }, [session?.user?.token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div>
      <Breadcrumb items={[{ label: 'People' }]} />
      <h1>Employees</h1>

      <div className="row mt-5">
        <div className="col-12">
          <p className="float-start">
            {isAdmin && (
              <ModalButton
                type={false}
                itemId={1}
                name="New Employee"
                FormComponent={FormEmployees}
                title="New Employee"
              />
            )}
            <Link href={`/admin/teams`} className="btn btn-primary ms-3">
              Teams
            </Link>
            <Link href={'/admin/employees/upload'} className="btn btn-light ms-3">
              Import data
            </Link>
          </p>
        </div>

        <div className="col-12">
          {loading && <div className="alert alert-info">Cargando todos los empleados…</div>}
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <PrimeDataTable
            models={filtered}             // <- LISTA COMPLETA (o filtrada) en cliente
            roles={roles}
            onSearchChange={setSearchTerm} // <- búsqueda en cliente
          />
        </div>
      </div>
    </div>
  );
}