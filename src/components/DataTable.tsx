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
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { Button } from 'primereact/button';

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
  models: Employee[];
  totalCount: number;
  limit: number;
  page: number;
  onPageChange: (newPage: number) => void;
  onSearchChange: (value: string) => void;
  onLimitChange: (newLimit: number) => void;
  roles: string[];
};

const PrimeDataTable: React.FC<Props> = ({
  models,
  totalCount,
  limit,
  page,
  onPageChange,
  onSearchChange,
  onLimitChange,
  roles
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [first, setFirst] = useState<number>((page - 1) * limit);
  const [rows, setRows] = useState<number>(limit);

  const dt = useRef<DataTable<Employee[]>>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sin estado duplicado: usar "models" directamente
  const data = models ?? [];

  // Mantener Paginator sincronizado si cambian props desde el padre
  useEffect(() => {
    setRows(limit);
    setFirst((page - 1) * limit);
  }, [limit, page]);

  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    setFirst(event.first);
    setRows(event.rows);
    onLimitChange(event.rows);
    const newPage = event.first / event.rows + 1;
    onPageChange(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ?? '';
    setGlobalFilter(value);

    // Debounce real limpiando timeouts anteriores
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  };

  // Al cambiar el filtro global, volver a la primera página visual del paginator
  useEffect(() => {
    setFirst(0);
  }, [globalFilter]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  const handleDeleteLocal = (id: number | string) => {
    // Como el estado fuente viene del padre, idealmente el padre recarga.
    // Si querés ocultarlo al toque sin esperar el refetch, podrías levantar
    // un callback al padre. Lo dejamos a decisión del flujo actual.
  };

  const renderHeader = () => (
    <div className="table-header text-end">
      <span className="p-input-icon-left" style={{ width: '100%' }}>
        <InputText
          type="search"
          value={globalFilter}
          onInput={handleSearchChange}
          placeholder="Search..."
          style={{ width: "100%" }}
        />
      </span>
    </div>
  );

  const header = renderHeader();

  const actionBodyTemplate = (item: Employee) => (
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

  const teamsTemplate = (item: Employee) => (
    <div key={`home_name_${item.id}`}>{item.teams?.name}</div>
  );

  const externalData = (item: Employee) => (
    <>
      <div key={`home_department_${item.id}`}>{item.actual_external_data?.home_department_description}</div>
      <div key={`job_title_${item.id}`}>{item.actual_external_data?.job_title_description}</div>
    </>
  );

  const businessData = (item: Employee) => (
    <div key={`business_unit_${item.id}`}>{item.actual_external_data?.business_unit_code}</div>
  );

  // Filtrado local opcional (además del backend). Si no lo querés, reemplazá por: const filteredData = data;
  const q = globalFilter.trim().toLowerCase();
  const filteredData = q
    ? data.filter(item => {
        const teamName = item.teams?.name?.toLowerCase() || '';
        return (
          item.name?.toLowerCase().includes(q) ||
          item.associate_id?.toLowerCase().includes(q) ||
          teamName.includes(q)
        );
      })
    : data;
  
  return (
    <div className="mb-5">
      <DataTable
        ref={dt}
        value={[...filteredData]}
        dataKey="id"
        rows={rows}
        header={header}
        globalFilter={globalFilter}
        emptyMessage="No data found."
        totalRecords={totalCount}
      >
        <Column field="associate_id" sortable header="ID" />
        <Column field="name" sortable header="Name" />
        <Column body={businessData} header="Business unit code" />
        <Column body={externalData} sortable header="Departament" />
        <Column body={teamsTemplate} sortable header="Teams" />
        <Column body={actionBodyTemplate} header="Actions" />
      </DataTable>

      <Paginator
        className="mt-4"
        first={first}
        rows={rows}
        totalRecords={totalCount}
        onPageChange={handlePageChange}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </div>
  );
};

export default PrimeDataTable;