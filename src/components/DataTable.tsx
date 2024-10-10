// components/PrimeDataTable.tsx
"use client";

import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import Link from "next/link"; // Importa Link de Next.js
import ModalButton from '@/components/Modal/NewFormModal';
import FormEmployees from "@/app/admin/employees/form/page";
import FormEmployeesTeams from "@/app/admin/employees/teams/page";
import RemoveItem from "./Core/RemoveItem";


const PrimeDataTable: React.FC = ({ users }) => {
    const [globalFilter, setGlobalFilter] = useState<string | null>(null);
    const renderHeader = () => {
    return (
      <div className="table-header">
        <span className="p-input-icon-left">
          {/* <i className="pi pi-search" /> */}
          <InputText
            type="search"
            onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGlobalFilter(e.target.value)
            }
            placeholder="Search..."
            style={{ width: "100%" }}
          />
        </span>
      </div>
    );
  };

const header = renderHeader();
const actionBodyTemplate = (item: User) => {
    return (
    <>      
        <a href={`/admin/employees/external_data/${item.id}`} className="btn btn-primary">
            External Data
        </a>
      <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Teams"
                          FormComponent={FormEmployeesTeams}
                          title={item.associate_id + " Teams"}
                        />
                        <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Edit"
                          FormComponent={FormEmployees}
                          title={item.associate_id}
                        />
                        <RemoveItem
                          url={name}
                          id={item.id}
                        />
    </>

    );
  };
  return (
    <div className="datatable-filter-demo">
      <DataTable
        value={users}
        paginator
        rows={10}
        header={header}
        globalFilter={globalFilter}
        emptyMessage="No data found." 
      >
        <Column field="associate_id" sortable header="ID" />
        <Column field="name" sortable header="Name" />
        <Column body={actionBodyTemplate} header="Actions"/> {/* Columna personalizada */}
      </DataTable>
    </div>
  );
};

export default PrimeDataTable;