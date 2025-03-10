import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import ModalButton from '@/components/Modal/NewFormModal';
import FormRatings from './form/page';
import RemoveItem from '@/components/Core/RemoveItem';
import { redirect } from 'next/navigation'
import { getUserRoles } from '@/functions/getRoles'
import Breadcrumb from "@/components/BreadCrumb";
import { Title } from '@/components/Title';

export default async function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)
  const roles = await getUserRoles();
  const bc = [{ label: 'Performance'}];

  if (!roles.some(role => ['superuser', 'administrator'].includes(role))) {
    redirect('/admin/home');
  }

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=1000`, 'GET');

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const results = data.data;
  const totalPages = Math.ceil(data.count / limit);

  return (
    <div>
      <Breadcrumb items={bc}/>
      <Title>Performance</Title>

      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            <ModalButton
              type={false}
              itemId={1}
              name="New performance"
              FormComponent={FormRatings}
              title={'New Performance'}
            />
          </p>
        </div>
        <div className='col-12 mt-3'>
          <table className="table table-hover">
            <thead>
              <tr>
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
                      {headers.map((header, colIndex) => (
                        <td key={header.key}>{item[header.key]}</td>
                      ))}
                      <td className='text-end'>
                        <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Edit"
                          FormComponent={FormRatings}
                          title={item.name}
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
        {/* <div className='col-12 mt-3'>
          <Pagination page={page} totalPages={totalPages} />
        </div> */}
      </div>
    </div>
  )
};