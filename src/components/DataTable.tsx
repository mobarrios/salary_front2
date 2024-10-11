// components/PrimeDataTable.tsx
"use client";
import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import Link from "next/link";
import ModalButton from '@/components/Modal/NewFormModal';
import FormEmployees from "@/app/admin/employees/form/page";
import FormEmployeesTeams from "@/app/admin/employees/teams/page";
import RemoveItem from "./Core/RemoveItem";
import { Paginator } from 'primereact/paginator';


const PrimeDataTable = ({ users, totalCount, limit, page , onPageChange, onSearchChange }) => {
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(limit);

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
      <div className="table-header">
        <span className="p-input-icon-left">
        <InputText
            type="search"
            onInput={handleSearchChange}
            placeholder="Search..."
            style={{ width: "100%" }}
          />
        </span>
      </div>
    );
  };

  const header = renderHeader();
  const actionBodyTemplate = (item) => (
    <>
      <Link href={`/admin/employees/external_data/${item.id}`} className="btn btn-primary">External Data</Link>
      <ModalButton type={true} itemId={item.id} name="Teams" FormComponent={FormEmployeesTeams} title={item.associate_id + " Teams"} />
      <ModalButton type={true} itemId={item.id} name="Edit" FormComponent={FormEmployees} title={item.associate_id} />
    </>
  );

  return (
    <>
      <DataTable
        value={users}
        //paginator
        rows={rows}
        header={header}
        globalFilter={globalFilter}
        emptyMessage="No data found."
        totalRecords={totalCount}
      >
        <Column field="associate_id" sortable header="ID" />
        <Column field="name" sortable header="Name" />
        <Column body={actionBodyTemplate} header="Actions" />
      </DataTable>
      <Paginator first={first} rows={rows} totalRecords={totalCount} onPageChange={handlePageChange} />
    </>
  );
};

export default PrimeDataTable;
