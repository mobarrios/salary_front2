import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import TableComponent from '@/components/Core/TableComponent';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name, buttonExtra } from './model';
import Link from 'next/link';

export default async function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const totalPages = Math.ceil(data.count / limit);

  return (
  <div className='container'>
    <h2 className='text-primary '>Employees</h2>
    <div className="row">
      <div className='col-12'>
        <Link href={`/admin/${name}/form`} className="btn btn-primary mt-3" > New </Link>
        <Link href="{'/admin/employees/upload'}" className="btn btn-secondary mt-3 ms-3" > Import data</Link>

      </div>
      <div className='col-12 mt-3'>
        <TableComponent data={data.data} model={name} headers={headers} buttonExtra={buttonExtra}/>
      </div>
      <div className='col-12 mt-3'>
        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  </div>
  )
};