'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { model, headers, name } from '@/app/admin/employees/model';
import { fetchData } from '@/server/services/core/fetchData'
import { Title } from '@/components/Title';
import ModalButton from '@/components/Modal/NewFormModal';
import FormEmployees from '@/app/admin/employees/form/page';
import { getUserRoles } from '@/functions/getRoles'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import Link from 'next/link';
import Breadcrumb from "@/components/BreadCrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from 'primereact/paginator';
import PrimeDataTable from '@/components/DataTable';

export default function TeamsEmployees({ searchParams }: Params) {

  const { page: initialPage = 1, limit: initialLimit = 10, search } = searchParams; // Obtener parámetros de búsqueda y paginación

  const { data: session, status } = useSession()
  const bc = [{ label: 'Teams', url: '/admin/teams' }, { label: 'Employees' }];

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(initialPage);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [models, setModels] = useState([])
  const { teams_id } = useParams();
  const [limit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState(search || ''); // Estado para el término de búsqueda

  const roles = session?.user.roles.map(role => role.name)
  const isAdmin = roles?.some(role => ['manager'].includes(role))
  console.log(isAdmin)

  const load = async () => {
    try {
      setLoading(true)
      const teamsEmployeesData = await fetchData(session?.user.token, 'GET', `teams_employees/all/?skip=0&limit=100`);
      if (teamsEmployeesData) {
        // Filtrar los equipos de empleados por teams_id
        const filteredTeamsEmployees = teamsEmployeesData.data.filter(team => team.teams_id == teams_id);

        // Obtener los employees_id de filteredTeamsEmployees
        const employeeIds = filteredTeamsEmployees.map(team => team.employees_id);

        // Obtener los datos de empleados
        const employeesDataResponse = await fetchData(session?.user.token, 'GET', 'employees/all/?skip=0&limit=100');
      
        // Filtrar employeesData para que solo incluya a los empleados cuyos id están en employeeIds
        const filteredEmployeesData = employeesDataResponse.data.filter(employee => employeeIds.includes(employee.id));
        setTotalCount(filteredEmployeesData.length);

        setModels(filteredEmployeesData)
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (session?.user.token) {
      load();
    }

  }, [page, limit, searchTerm,teams_id, session?.user.token]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

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
      <Breadcrumb items={bc} />
      <Title>Employees</Title>
      <div className="row mt-5">
        <div className='col-12 mt-3'>

        <PrimeDataTable
          models={models}
          totalCount={totalCount}
          limit={limit} 
          page={page}
          onPageChange={handlePageChange}
          onSearchChange={onSearchChange} // Pasa la función de búsqueda
          roles={roles}
        />

          {/* <Column field="associate_id" sortable header="ID" />
        <Column field="name" sortable header="Name" /> */}
          {/* <Column body={actionBodyTemplate} header="Actions" /> */}
          {/* </DataTable> */}
          {/* <Paginator first={first} rows={rows} totalRecords={totalCount} onPageChange={handlePageChange} /> */}

          {/* <table className="table table-hover ">
            <thead>
              <tr>
                <th>#</th>
                {headers.map((header, key) => (
                  <th key={key}>{header.name}</th>
                ))}
                <th>Team</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                items ? (
                  items.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{item.id}</td>
                      {headers.map((header, colIndex) => (
                        <td key={header.key}>{item[header.key]}</td>
                      ))}
                      <td>
                        {item.teams.map((team, i) => (
                          <div key={i}>{team.name}</div> // Asegúrate de usar un key único
                        ))}
                      </td>
                      <td className="text-end" >
                        <Link
                          href={'/admin/employees/external_data/' + item.id}
                          className='btn btn-primary'
                        >External data </Link>
                        {isAdmin && (<ModalButton
                          type={true}
                          itemId={item.id}
                          name="Edit"
                          FormComponent={FormEmployees}
                          title={item.associate_id}
                        />)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length + 2}>No data available</td>
                  </tr>
                )
              }
            </tbody>
          </table> */}
        </div>
        <div className='col mt-5'>
        </div>
      </div>
    </div>
  )
};
