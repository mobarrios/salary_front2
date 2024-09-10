import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import TableComponent from '@/components/Core/TableComponent';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name, buttonExtra } from './model';
import FormReview from './form/page';
import ReviewTeam from './teams/page';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import ModalButton from '@/components/Modal/NewFormModal';
import RemoveItem from '@/components/Core/RemoveItem';
import Link from 'next/link';
import { Title } from '@/components/Title';

export default async function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');
  const session = await getServerSession(authOptions)

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const results = data.data;
  const totalPages = Math.ceil(data.count / limit);
  const isAdmin = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'administrator');

  return (
    <div>
      <Title> Merit Cycle</Title>
      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            {isAdmin && (
              <ModalButton
                type={false}
                itemId={1}
                name="New Merit Cycle"
                FormComponent={FormReview}
                title="New Merit Cycle"
              />
            )}
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
                          {header.key === 'price' ? (
                            item[header.key]?.toFixed(2)
                          ) : header.key === 'status' ? (
                            header.options.find(option => option.value === String(item[header.key]))?.label || 'Desconocido'
                          ) : (
                            item[header.key]
                          )}
                        </td>
                      ))}
                      <td className="text-end">
                        {isAdmin && (
                          <ModalButton
                            type={true}
                            itemId={item.id}
                            name="Budgets"
                            FormComponent={ReviewTeam}
                            title={"Budgets for  " + item.name}
                          />
                        )}
                        <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Edit"
                          FormComponent={FormReview}
                          title={'Edit : ' + item.name}

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