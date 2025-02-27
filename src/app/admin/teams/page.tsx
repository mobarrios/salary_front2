'use client'
import { useState, useEffect, useCallback, useRef } from 'react';

import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import ModalButton from '@/components/Modal/NewFormModal';
import FormTeams from './form/page';
import RemoveItem from '@/components/Core/RemoveItem';
import UserTeams from './user/page';
import { Title } from '@/components/Title';
import { getUserRoles, getUserId } from '@/functions/getRoles'
import Link from 'next/link';
import Breadcrumb from "@/components/BreadCrumb";
import { fetchData } from '@/server/services/core/fetchData'
import { useSession } from 'next-auth/react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from 'primereact/paginator';
import { count } from 'console';

export default function Employees({ searchParams }: Params) {

  const bc = [{ label: 'Teams', url: '/admin/teams' }, { label: 'Employees' }];

  const { page: initialPage = 1, limit: initialLimit = 10, search } = searchParams; // Obtener parámetros de búsqueda y paginación
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit); // Cambia a estado
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState(search || ''); // Estado para el término de búsqueda

  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(limit);
  const [data, setData] = useState([]); // Inicializa el estado con models

  const roles = session?.user.roles.map(role => role.name)
  const isAdmin = roles?.some(role => ['superuser', 'administrator'].includes(role))

  const load = useCallback(async () => {
    if (session?.user.token) {
      try {
        setResults([]); // Limpiar resultados anteriores
        setTotalCount(0);
        const res = await fetchData(
          session?.user.token,
          'GET',
          `${name}/all/?skip=${(page - 1) * limit}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}`
        );
      
        if (res && res.data) {
          let filteredResults = res.data; // Inicializa filteredResults con los datos obtenidos
          let cont = res.count;

          if (!isAdmin) {
            const loggedInUserId = session?.user.id;
            console.log('loggedInUserId', session?.user)
            const teamsUsers = await fetchData(
              session?.user.token,
              'GET',
              `teams_users/all/?skip=0&limit=1000`
            );

            if (teamsUsers && teamsUsers.data) {
              //const teamsData = teamsUsers.data // Asegúrate de que teamsUsers sea un objeto con método json
              const filteredTeams = teamsUsers.data.filter(team => team.users_id === loggedInUserId);

              // Filtrar los resultados según los equipos que tiene el usuario logueado
              filteredResults = filteredResults.filter(result =>
                filteredTeams.some(team => team.teams_id === result.id)
              );

              cont = filteredResults.length
            }
          }

          setResults(filteredResults); // Establece los resultados filtrados
          setTotalCount(cont); // Establece el total de elementos en filteredResults
        } else {
          console.error("Invalid data:", res);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }, [page, limit, searchTerm, session?.user.token, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const onLimitChange = (newLimit) => {
    setLimit(newLimit); // Actualiza el límite
    setPage(1); // Reinicia a la primera página si cambias el límite
  };

  const filteredData = results.filter(item => {
    //const teamName = item.teams?.name?.toLowerCase() || '';
    return item
  });

  const handlePageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    onLimitChange(event.rows);
    setPage(event.first / event.rows + 1); // Calcula la nueva página y llama a la función onPageChange
  };

  const dt = useRef(null);

  useEffect(() => {
    dt.current?.reset(); // Resetea el DataTable para forzar un re-render
  }, [filteredData]);

  const handleDeleteLocal = (id) => {
    // Elimina el registro del estado local
    const updatedData = results.filter((item) => item.id !== id);
    setResults(updatedData)
    //setData(updatedData); // Actualiza el estado para reflejar los cambios en la tabla
  };

  const actionBodyTemplate = (item) => (
    <>
      <ModalButton
        type={true}
        itemId={item.id}
        name="Users"
        FormComponent={UserTeams}
        title={item.name + " : Users"}
      />

      {roles.some(role => ['superuser', 'administrator', 'manager'].includes(role)) && (
        <>
          <ModalButton
            type={true}
            itemId={item.id}
            name="Save"
            FormComponent={FormTeams}
            title={"Edit : " + item.name}
          />
          {/* <ModalButton type={true} itemId={item.id} name="Edit" FormComponent={FormTeams} title={item.associate_id} /> */}
        </>
      )}

      {roles.some(role => ['superuser', 'administrator'].includes(role)) && (
        <>
          <RemoveItem id={item.id} url={name} onDelete={() => handleDeleteLocal(item.id)} />
        </>
      )}
    </>

  );

  // const {page, search, limit, skip} = usePaginate(searchParams)

  // const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');

  // const roles = await getUserRoles();
  // const isAdmin = roles.some(role => ['superuser', 'administrator'].includes(role))

  // if (!res?.status) {
  //   throw new Error('Failed to fetch data');
  // }

  // const data = await res.json();
  // let results = data.data;
  // const totalPages = Math.ceil(data.count / limit);

  // if (!isAdmin) {
  //   const loggedInUserId = await getUserId();
  //   const teamsUsers = await apiRequest(`teams_users/all/?skip=${skip}&limit=${limit}`, 'GET');

  //   const teamsData = await teamsUsers.json();
  //   const filteredTeams = teamsData.data.filter(team => team.users_id === loggedInUserId);

  //   // Filtrar los resultados según los equipos que tiene el usuario logueado
  //   results = results.filter(result =>
  //     filteredTeams.some(team => team.teams_id === result.id)
  //   );
  // }

  return (
    <div>
      <Breadcrumb items={bc} />
      <Title>Teams</Title>
      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            {isAdmin && (<ModalButton
              type={false}
              itemId={1}
              name="New Team"
              FormComponent={FormTeams}
              title={"New Team"}
            />)}
          </p>
        </div>
        <DataTable
          ref={dt}
          value={[...filteredData]}
          dataKey="id"
          rows={rows}
          header={false}
          globalFilter={globalFilter}
          emptyMessage="No data found."
          totalRecords={totalCount}
        >
          <Column field="id" sortable header="ID" />
          <Column field="name" sortable header="Name" />
          <Column body={actionBodyTemplate} header="Actions" />

        </DataTable>
        <Paginator
          className="mt-4"
          first={first}
          rows={rows}
          totalRecords={totalCount}
          onPageChange={handlePageChange}
          rowsPerPageOptions={[10, 25, 50]} // Configura las opciones de filas por página
        />

      </div>
    </div>
  )
};