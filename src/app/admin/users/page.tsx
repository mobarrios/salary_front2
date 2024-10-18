import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import ModalButton from '@/components/Modal/NewFormModal';
import RemoveItem from '@/components/Core/RemoveItem';
import FormUsers from './form/page';
import FormRol from './rol/page';
import { Title } from '@/components/Title';
import { redirect } from 'next/navigation'
import { getUserRoles } from '@/functions/getRoles'
import Breadcrumb from "@/components/BreadCrumb";

export default async function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)
  const roles = await getUserRoles();
  const bc = [{ label: 'Users' }];

  if (!roles.some(role => ['superuser'].includes(role))) {
    redirect('/admin/home');
  }

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const results = data.data;
  const totalPages = Math.ceil(data.count / limit);
  console.log(results)
  return (
    <div>
      <Breadcrumb items={bc} />

      <Title>Users</Title>
      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            <ModalButton
              type={false}
              itemId={1}
              name="New user"
              FormComponent={FormUsers}
              title={"New User"}
            />
          </p>
        </div>
        <div className='col-12 mt-3'>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                {headers.map((header, key) => (
                  <th scope="col" key={key}>{header.name}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                results ? (
                  results.map((item, rowIndex) => (
                    <tr className="align-middle" key={rowIndex}>
                      <td>{item.id}</td>
                      {headers.map((header, colIndex) => (

                        <td key={header.key}>
                          {header.key === 'active' ? (item.active === 1 ? 'Active' : 'Inactive') : item[header.key]}
                        </td>))}
                      <td className='text-end'>
                        <ModalButton
                          type={false}
                          itemId={item.id}
                          name="Rol"
                          FormComponent={FormRol}
                          title={"Rol : " + item.user_name}
                        />
                        <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Edit"
                          FormComponent={FormUsers}
                          title={"Edit : " + item.user_name}
                        />
                        <RemoveItem
                          url={name}
                          id={item.id}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length + 2}>No data available</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
        <div className='col-12 mt-3'>
          <Pagination page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
};