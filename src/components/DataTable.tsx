// components/PrimeDataTable.tsx
"use client";
import React, { useState, useRef } from "react";
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

const PrimeDataTable = ({ models, totalCount, limit, page, onPageChange, onSearchChange, roles }) => {
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(limit);
  const dt = useRef(null);

  const handlePageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    onPageChange(event.first / event.rows + 1); // Calcula la nueva página y llama a la función onPageChange
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    onSearchChange(value); // Llama a la función para cambiar la búsqueda en el componente padre
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
        <span className="ms-5">
          <Button label="Export" icon="pi pi-upload" className="p-button-success" onClick={exportCSV} />
        </span>
      </div>
    );
  };

  const exportCSV = () => {
    dt.current.exportCSV();
  };
  //roles.some(role => ['superuser', 'administrator'].includes(role)
  const header = renderHeader();
  const actionBodyTemplate = (item) => (
    <>
      <Link href={`/admin/employees/external_data/${item.id}`} className="btn btn-primary">External Data</Link>
      {roles.some(role => ['superuser', 'administrator', 'manager'].includes(role)) && (
        <>
          <ModalButton type={true} itemId={item.id} name="Teams" FormComponent={FormEmployeesTeams} title={item.associate_id + " Teams"} />
          <ModalButton type={true} itemId={item.id} name="Edit" FormComponent={FormEmployees} title={item.associate_id} />
          <RemoveItem id={item.id} url='reviews_teams' />
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
  )

  return (
    <div className="mb-5">
      <DataTable
        ref={dt}
        value={models}
        //paginator
        rows={rows}
        header={header}
        globalFilter={globalFilter}
        emptyMessage="No data found."
        totalRecords={totalCount}
        //rowsPerPageOptions={[10, 25, 50]}
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
        //rowsPerPageOptions={[10, 25, 50]}
      />
    </div>

  );
};

export default PrimeDataTable;
