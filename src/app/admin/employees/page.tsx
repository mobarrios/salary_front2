import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import TableComponent from '@/components/Core/TableComponent';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import Link from 'next/link';

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
    <div className="mt-5">
      <h1>Employees</h1>

      <Link
        href={`/admin/${name}/form`}
        className="btn btn-primary">
        New
      </Link>

      <TableComponent data={data.data} model={name} headers={headers} />

      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
};