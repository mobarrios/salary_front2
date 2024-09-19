import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import FormReview from './form/page';
import ReviewTeam from './teams/page';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import ModalButton from '@/components/Modal/NewFormModal';
import RemoveItem from '@/components/Core/RemoveItem';
import { Title } from '@/components/Title';
import { formatDate, formatPrice } from '../../../functions/formatDate';

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
                      <td>{item.name}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td>{item.status === 1 ? 'Progress' : 'Clossed'}</td>
                      <td>
                        {formatDate(item.form)} - {formatDate(item.to)}
                      </td>
                      <td className="text-end">
                        <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Budgets"
                          FormComponent={ReviewTeam}
                          title={"Budgets for  " + item.name}
                        />
                        {isAdmin && (<> <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Edit"
                          FormComponent={FormReview}
                          title={'Edit : ' + item.name}

                        />
                          <RemoveItem
                            url={name}
                            id={item.id}
                          /></>)}
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