'use client'
import { apiRequest } from '@/server/services/core/apiRequest';
import { Params } from '@/types/params';
import { headers, name } from './model';
import Link from 'next/link';
import ModalButton from '@/components/Modal/NewFormModal';
import FormEmployees from './form/page';
import PrimeDataTable from '@/components/DataTable';
import { getUserRoles } from '@/functions/getRoles';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { fetchData } from '@/server/services/core/fetchData'
import Breadcrumb from "@/components/BreadCrumb";

export default function Employees({ searchParams }: Params) {
  const { page: initialPage = 1, limit: initialLimit = 10, search } = searchParams;

  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [results, setResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState<string>(search || '');
  const roles = session?.user.roles.map((role: any) => role.name) || [];
  const bc = [{ label: 'People' }];

  // Control de carreras: “última respuesta gana”
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!session?.user?.token) return;

    const myId = ++requestIdRef.current;

    try {
      // Opcional: mostrar estado de carga limpiando momentáneamente
      setResults([]);
      setTotalCount(0);

      const url =
        `${name}/all/?skip=${(page - 1) * limit}&limit=${limit}` +
        (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '');

      const res = await fetchData(
        session.user.token,
        'GET',
        url
      );

      // Ignorar respuestas viejas
      if (myId !== requestIdRef.current) return;

      if (res?.data) {
        setResults(res.data);
        setTotalCount(res.count ?? 0);
      } else {
        console.error('Invalid data:', res);
      }
    } catch (error) {
      // Si esta respuesta ya no es la última, ignorar el error
      if (myId === requestIdRef.current) {
        console.error('Error fetching data:', error);
      }
    }
  }, [page, limit, searchTerm, session?.user?.token]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const onSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div>
      <Breadcrumb items={bc} />
      <h1>Employees</h1>

      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            {isAdmin && (
              <ModalButton
                type={false}
                itemId={1}
                name="New Employee"
                FormComponent={FormEmployees}
                title="New Employee"
              />
            )}
            <Link href={`/admin/teams`} className="btn btn-primary ms-3">Teams</Link>
            <Link href={'/admin/employees/upload'} className="btn btn-light ms-3">Import data</Link>
          </p>
        </div>

        <PrimeDataTable
          models={results}
          totalCount={totalCount}
          limit={limit}
          page={page}
          onPageChange={handlePageChange}
          onSearchChange={onSearchChange}
          onLimitChange={onLimitChange}
          roles={roles}
        />
      </div>
    </div>
  );
}
