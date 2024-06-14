import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import TableComponent from '@/components/Core/TableComponent';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import Link from 'next/link';
import Head from 'next/head';

export default async function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const totalPages = Math.ceil(data.count / limit);

  console.log(data)

  return (
    <div className="row">
      <div className='col-12'>
           <h1 className='text-primary'>Roles</h1>
      </div>
      <div className='col-12'>
        <Link
          href={`/admin/${name}/form`}
          className="btn btn-primary mt-3" >
          New
        </Link>
      </div>
      <div className='col-12 mt-3'>
        <TableComponent data={data.data} model={name} headers={headers} />
      </div>
      <div className='col-12 mt-3'>
        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  )
};