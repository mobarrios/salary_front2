import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import TableComponent from '@/components/Core/TableComponent';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name, buttonExtra } from './model';
import Link from 'next/link';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'

export default async function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');
  const session = await getServerSession(authOptions)

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const totalPages = Math.ceil(data.count / limit);

  const isAdmin = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'administrator');
  
  return (
    <div className="row">
      <div className='col-12'>
        <h1 className='text-primary'>Reviews</h1>
      </div>
      <div className='col-12'>
        {isAdmin && (
          <Link
            href={`/admin/${name}/form`}
            className="btn btn-primary mt-3"
          >
            New
          </Link>
        )}
      </div>
      <div className='col-12 mt-3'>
        <TableComponent data={data.data} model={name} headers={headers} buttonExtra={buttonExtra} />
      </div>
      <div className='col-12 mt-3'>
        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  )
};