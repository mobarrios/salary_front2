import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import Link from 'next/link';
import ModalButton from '@/components/Modal/NewFormModal';
import FormEmployees from './form/page';
import RemoveItem from '@/components/Core/RemoveItem';
import FormEmployeesTeams from './teams/page';
import { Title } from '@/components/Title';
import { getUserRoles } from '@/functions/getRoles'

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import PrimeDataTable from '@/components/DataTable';

export default async function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)

  const roles = await getUserRoles();
  const isAdmin = roles.some(role => ['superuser', 'administrator'].includes(role));

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const results = data.data

  const totalPages = Math.ceil(data.count / limit);

  return (
    <div>
      <Title>Employees</Title>
      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            {
              isAdmin && (
                <ModalButton
                  type={false}
                  itemId={1}
                  name="New Employee"
                  FormComponent={FormEmployees}
                  title="New Employee"
                />
              )}
            <Link href={`/admin/teams`} className="btn btn-primary  ms-3" >Teams </Link>
            <Link href={'/admin/employees/upload'} className="btn btn-light  ms-3" > Import data</Link>

          </p>
        </div>
        <DataTable
          value={results}
          paginator
          rows={10}
          // header={header}
          // globalFilter={globalFilter}
          emptyMessage="No data found."
        >
          <Column field="associate_id" sortable header="ID" />
          <Column field="name" sortable header="Name" />
          {/* <Column body={actionBodyTemplate} header="Actions"/>  */}
          {/* Columna personalizada */}
        </DataTable>

        <PrimeDataTable users={results}/> 


      </div>
    </div>
  )
};