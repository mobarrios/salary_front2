import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import ModalButton from '@/components/Modal/NewFormModal';
import FormTeams from './form/page';
import RemoveItem from '@/components/Core/RemoveItem';

export default async function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');

  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  const results = data.data;
  const totalPages = Math.ceil(data.count / limit);

  return (
    <div className='container'>
      <h2 className='text-primary '>Teams</h2>
      <div className="row">
        <div className='col-12'>
          <p className='float-end'>
            <ModalButton
              type={false}
              itemId={1}
              name="New team"
              FormComponent={FormTeams}
            />
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
                      <td>
                        <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Edit"
                          FormComponent={FormTeams}
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