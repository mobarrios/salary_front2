import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import TableComponent from '@/components/Core/TableComponent';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import Link from 'next/link';
import Head from 'next/head';
import { Title } from '@/components/Title';
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'

export default async function Employees({ searchParams }: Params) {

  const session = await getServerSession(authOptions)

  const isSuper = session?.user.roles.some(role => role.name === 'superuser');
  if(!isSuper){
    redirect('/admin/home')
  }
  
  const { page, search, limit, skip } = usePaginate(searchParams)

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const totalPages = Math.ceil(data.count / limit);


  return (
    <div>
    <Title>Roles</Title>
    <div className="row">
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
    </div>
  )
};