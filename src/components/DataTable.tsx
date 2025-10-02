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

type Employee = {
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

type Props = {
  models: Employee[];                    // <- TODA la data (filtrada) para ordenar globalmente
  roles: string[];
  onSearchChange: (value: string) => void;
};

const PrimeDataTable: React.FC<Props> = ({ models, roles, onSearchChange }) => {
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(25);
  const [search, setSearch] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ?? "";
    setSearch(value);
    setFirst(0);
    onSearchChange(value); // el padre filtra en cliente
  };

  const actionBodyTemplate = (item: Employee) => (
    <>
      <Link href={`/admin/employees/external_data/${item.id}`} className="btn btn-primary">Details</Link>

      {roles.some(role => ['superuser', 'administrator', 'manager'].includes(role)) && (
        <ModalButton type={true} itemId={item.id} name="Edit" FormComponent={FormEmployees} title={item.associate_id} />
      )}

      {roles.some(role => ['superuser', 'administrator'].includes(role)) && (
        <>
          <ModalButton type={true} itemId={item.id} name="Teams" FormComponent={FormEmployeesTeams} title={item.associate_id + " Teams"} />
          <RemoveItem id={item.id} url='employees' onDelete={() => { /* opcional: pedir refetch al padre */ }} />
        </>
      )}
    </>
  );

  const businessData = (item: Employee) => (
    <div>{item.actual_external_data?.business_unit_code}</div>
  );

  const externalData = (item: Employee) => (
    <>
      <div>{item.actual_external_data?.home_department_description}</div>
      <div>{item.actual_external_data?.job_title_description}</div>
    </>
  );

  const teamsTemplate = (item: Employee) => (
    <div>{item.teams?.name}</div>
  );

  return (
    <div className="mb-5">
      <div className="table-header text-end mb-3">
        <span className="p-input-icon-left" style={{ width: '100%' }}>
          <InputText
            type="search"
            value={search}
            onInput={handleSearchChange}
            placeholder="Search..."
            style={{ width: "100%" }}
          />
        </span>
      </div>

      <DataTable
        value={models}          // <- lista completa; DataTable se encarga de ordenar y paginar
        dataKey="id"
        paginator               // <- paginación interna
        rows={rows}
        first={first}
        onPage={(e) => { setFirst(e.first); setRows(e.rows); }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        sortMode="single"       // o 'multiple' si querés
        removableSort
        emptyMessage="No data found."
      >
        <Column field="associate_id" sortable header="ID" />
        <Column field="name" sortable header="Name" />
        <Column body={businessData} header="Business unit code" />
        <Column body={externalData} header="Department" />
        <Column body={teamsTemplate} header="Teams" />
        <Column body={actionBodyTemplate} header="Actions" />
      </DataTable>
    </div>
  );
};




export default PrimeDataTable;