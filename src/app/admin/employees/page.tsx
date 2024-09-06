import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import TableComponent from '@/components/Core/TableComponent';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name, buttonExtra } from './model';
import Link from 'next/link';
import ModalButton from '@/components/Modal/NewFormModal';
import FormEmployees from './form/page';
import RemoveItem from '@/components/Core/RemoveItem';
import FormEmployeesTeams from './teams/page';

export default async function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const results = data.data
  const totalPages = Math.ceil(data.count / limit);

  return (
    <div className='container'>
      <h1 className='text-primary '>Employees</h1>
      <div className="row">
        <div className='col-12'>
          <p className='float-end'>
            <ModalButton
              type={false}
              itemId={1}
              name="New Employee"
              FormComponent={FormEmployees}
            />

            <Link href={'/admin/employees/upload'} className="btn btn-secondary  ms-3" > Import data</Link>
            <Link href={`/admin/teams`} className="btn btn-primary  ms-3" >Teams </Link>
          </p>
        </div>
        <div className='col-12 mt-3'>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                {headers.map((header, key) => (
                  <th scope="col" key={key}>{header.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {
                results ? (
                  results.map((item, rowIndex) => (
                    <tr className="align-middle" key={rowIndex}>
                      <td>{item.id}</td>
                      {headers.map((header, colIndex) => (
                        <td key={header.key}>{item[header.key]}</td>
                      ))}
                      <td className='text-left'>
                        <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Teams"
                          FormComponent={FormEmployeesTeams}
                        />
                        <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Edit"
                          FormComponent={FormEmployees}
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