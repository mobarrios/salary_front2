'use client'
import { apiRequest } from '@/server/services/core/apiRequest';
import { Params } from '@/types/params';
import { headers, name } from './model';
import Link from 'next/link';
import ModalButton from '@/components/Modal/NewFormModal';
import FormEmployees from './form/page';
import PrimeDataTable from '@/components/DataTable';
import { getUserRoles } from '@/functions/getRoles';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { fetchData } from '@/server/services/core/fetchData'
import Breadcrumb from "@/components/BreadCrumb";

export default function Employees({ searchParams }: Params) {
  const { page: initialPage = 1, limit: initialLimit = 10, search } = searchParams; // Obtener parámetros de búsqueda y paginación
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit); // Cambia a estado
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState(search || ''); // Estado para el término de búsqueda
  const roles = session?.user.roles.map(role => role.name)
  const bc = [{ label: 'People' }];

  useEffect(() => {
    const load = async () => {
      if (session?.user.token) {
        try {
          const res = await fetchData(session?.user.token, 'GET', `${name}/all/?skip=${(page - 1) * limit}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}`);

          // Verifica si la respuesta tiene los datos esperados
          if (res && res.data) {
            console.log(res.data)
            setResults(res.data); // Establece los resultados
            setTotalCount(res.count); // Establece el total de conteo
          } else {
            console.error("No se recibieron datos válidos:", res);
          }
        } catch (error) {
          console.error("Error al cargar los datos:", error);
        }
      }
    };
    load();
  }, [page, limit, searchTerm, session?.user.token]); // Dependencias que activan el efecto

  const handlePageChange = (newPage) => {
    setPage(newPage); // Cambia la página
  };

  const onSearchChange = (value: string) => {
    setSearchTerm(value); // Actualiza el término de búsqueda
    setPage(1); // Reinicia a la primera página
  };

  const onLimitChange = (newLimit) => {
    console.log('llega',newLimit)
    setLimit(newLimit); // Actualiza el límite
    setPage(1); // Reinicia a la primera página si cambias el límite
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
          onSearchChange={onSearchChange} // Pasa la función de búsqueda
          onLimitChange={onLimitChange}
          roles={roles}


        />
      </div>
    </div>
  );
}