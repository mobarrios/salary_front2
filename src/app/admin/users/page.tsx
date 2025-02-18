'use client'
import { useState, useEffect, useCallback, useRef } from 'react';

import { Params } from '@/types/params';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import ModalButton from '@/components/Modal/NewFormModal';
import RemoveItem from '@/components/Core/RemoveItem';
import FormUsers from './form/page';
import FormRol from './rol/page';
import { Title } from '@/components/Title';
import Breadcrumb from "@/components/BreadCrumb";
import { useSession } from 'next-auth/react';
import { fetchData } from '@/server/services/core/fetchData'
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Paginator } from 'primereact/paginator';
import Link from 'next/link';
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
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(limit);
  const [data, setData] = useState([]); // Inicializa el estado con models

  const load = useCallback(async () => {
    if (session?.user.token) {
      try {

        setResults([]); // Limpiar resultados anteriores
        setTotalCount(0)
        const res = await fetchData(
          session?.user.token,
          'GET',
          `${name}/all/?skip=${(page - 1) * limit}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}`
        );

        if (res && res.data) {
          setResults(res.data);
          setTotalCount(res.count);
        } else {
          console.error("Invalid data:", res);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }, [page, limit, searchTerm, session?.user.token]);

  useEffect(() => {
    load();
  }, [load]);


  const onLimitChange = (newLimit) => {
    setLimit(newLimit); // Actualiza el límite
    setPage(1); // Reinicia a la primera página si cambias el límite
  };

  const filteredData = results.filter(item => {
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
        <ModalButton type={true} itemId={item.id} name="Role" FormComponent={FormRol} title={item.user_name} />
          {roles.some(role => ['superuser', 'administrator', 'manager'].includes(role)) && (
        <>
          <ModalButton type={true} itemId={item.id} name="Edit" FormComponent={FormUsers} title={item.associate_id} />
        </>
      )}

      {roles.some(role => ['superuser', 'administrator'].includes(role)) && (
        <>
          <RemoveItem id={item.id} url={name} onDelete={() => handleDeleteLocal(item.id)} />
        </>
      )}
    </>

  );

  const externalData = (item) => (
    <>
      <div key={`home_department_${item.id}`}>
         { item.active === 1 ? <span className="badge rounded-pill bg-success">Active</span> : <span className="badge rounded-pill bg-success">Inactive</span> }
        </div>
    </>
  );


  return (
    <div>
      <Breadcrumb items={bc} />

      <Title>Users</Title>
      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            <ModalButton
              type={false}
              itemId={1}
              name="New user"
              FormComponent={FormUsers}
              title={"New User"}
            />
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
          <Column field="user_name" sortable header="Name" />
          <Column field="email" sortable header="Email" />
          {/* <Column field="active" sortable header="Status" /> */}
          <Column body={externalData} sortable header="Status" />
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