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
  const [limit] = useState(initialLimit); // Mantener el límite constante
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState(search || ''); // Estado para el término de búsqueda
  const roles = session?.user.roles.map(role => role.name)
  const bc = [{ label: 'People'}];

  useEffect(() => {
    const load = async () => {
      const res = await fetchData(session?.user.token, 'GET', `${name}/all/?skip=${(page - 1) * limit}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}`);
      console.log(res)
      setResults(res?.data);
      setTotalCount(res?.count);
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
  console.log(roles)
  return (
    <div>
      <Breadcrumb items={bc}/>

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
          roles={roles}
        />
      </div>
    </div>
  );
}