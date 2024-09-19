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
        <div className='col-12 mt-3'>
          <table className="table table-hover ">
            <thead>
              <tr>
                <th>#</th>
                {headers.map((header, key) => (
                  <th key={key}>{header.name}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                results ? (
                  results.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{item.id}</td>
                      {headers.map((header, colIndex) => (
                        <td key={header.key}>{item[header.key]}</td>
                      ))}
                      <td className="text-end" >
                        <Link
                          href={'/admin/employees/external_data/' + item.id}
                          className='btn btn-primary'
                        >External data </Link>

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
        <div className='col mt-5'>
          <Pagination page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
};