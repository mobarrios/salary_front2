"use client";
import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import Link from "next/link";
import ModalButton from '@/components/Modal/NewFormModal';
import FormEmployees from "@/app/admin/employees/form/page";
import FormEmployeesTeams from "@/app/admin/employees/teams/page";
import RemoveItem from "./Core/RemoveItem";
import { Paginator } from 'primereact/paginator';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

const PrimeDataTable = ({ models, totalCount, limit, page, onPageChange, onSearchChange, onLimitChange, roles }) => {
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(limit);
  const [data, setData] = useState(models); // Inicializa el estado con models
  const dt = useRef(null);

  // Efecto para actualizar el estado de data cuando models cambia
  useEffect(() => {
    setData(models);
  }, [models]); // Solo se ejecuta cuando models cambia

  const handlePageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    onLimitChange(event.rows);
    onPageChange(event.first / event.rows + 1); // Calcula la nueva página y llama a la función onPageChange
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    onSearchChange(value); // Llama a la función para cambiar la búsqueda en el componente padre
  };

  const handleRowsPerPageChange = (event) => {
    setRows(event.rows); // Actualiza el número de filas por página
    setFirst(0); // Reinicia el paginador a la primera página
    onPageChange(1); // Reinicia la página actual a la primera
  };

  const handleDeleteLocal = (id) => {
    // Elimina el registro del estado local
    const updatedData = data.filter((item) => item.id !== id);
    setData(updatedData); // Actualiza el estado para reflejar los cambios en la tabla
  };

  const renderHeader = () => {
    return (
      <div className="table-header text-end">
        <span className="p-input-icon-left">
          <InputText
            type="search"
            onInput={handleSearchChange}
            placeholder="Search..."
            style={{ width: "100%" }}
          />
        </span>
        {/* <span className="ms-5">
          <Button label="Export" icon="pi pi-upload" className="p-button-success" onClick={exportCSV} />
        </span> */}
      </div>
    );
  };

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const header = renderHeader();

  const actionBodyTemplate = (item) => (
    <>
      <Link href={`/admin/employees/external_data/${item.id}`} className="btn btn-primary">Details</Link>
      {roles.some(role => ['superuser', 'administrator', 'manager'].includes(role)) && (
        <>
          <ModalButton type={true} itemId={item.id} name="Edit" FormComponent={FormEmployees} title={item.associate_id} />
        </>
      )}

      {roles.some(role => ['superuser', 'administrator'].includes(role)) && (
        <>
          <ModalButton type={true} itemId={item.id} name="Teams" FormComponent={FormEmployeesTeams} title={item.associate_id + " Teams"} />
          <RemoveItem id={item.id} url='employees' onDelete={() => handleDeleteLocal(item.id)} />

        </>
      )}
    </>
  );

  const teamsTemplate = (item) => (
    <>
      {
        item.teams.map((item, i) => (
          <div>{item.name}</div>
        ))
      }
    </>
  );

  return (
    <div className="mb-5">
      <DataTable
        ref={dt}
        value={data} // Usa el estado data en lugar de models
        dataKey="id"
        rows={rows}
        header={header}
        globalFilter={globalFilter}
        emptyMessage="No data found."
        totalRecords={totalCount}
      >
        <Column field="associate_id" sortable header="ID" />
        <Column field="name" sortable header="Name" />
        <Column body={teamsTemplate} sortable header="Teams" />
        <Column body={actionBodyTemplate} header="Actions" />
      </DataTable>
      <Paginator
        className="mt-4"
        first={first}
        rows={rows}
        totalRecords={totalCount}
        onPageChange={handlePageChange}
        rowsPerPageOptions={[10, 25, 50]} // Configura las opciones de filas por página
        onRowsPerPageChange={handleRowsPerPageChange} // Llama a la función handleRowsPerPageChange
        />

    </div>
  );
};

export default PrimeDataTable;
