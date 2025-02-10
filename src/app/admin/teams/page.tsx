import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import ModalButton from '@/components/Modal/NewFormModal';
import FormTeams from './form/page';
import RemoveItem from '@/components/Core/RemoveItem';
import UserTeams from './user/page';
import { Title } from '@/components/Title';
import { getUserRoles, getUserId } from '@/functions/getRoles'
import Link from 'next/link';
import Breadcrumb from "@/components/BreadCrumb";

export default async function Employees({ searchParams }: Params) {
  const bc = [{ label: 'Teams', url:'/admin/teams'},{label:'Employees'}];

  const { page, search, limit, skip } = usePaginate(searchParams)

  const res = await apiRequest(`${name}/all/?skip=${skip}&limit=${limit}`, 'GET');

  const roles = await getUserRoles();
  const isAdmin = roles.some(role => ['superuser', 'administrator'].includes(role))
  
  if (!res?.status) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  let results = data.data;
  const totalPages = Math.ceil(data.count / limit);

  if (!isAdmin) {
    const loggedInUserId = await getUserId();
    const teamsUsers = await apiRequest(`teams_users/all/?skip=${skip}&limit=${limit}`, 'GET');

    const teamsData = await teamsUsers.json();
    const filteredTeams = teamsData.data.filter(team => team.users_id === loggedInUserId);
  
    // Filtrar los resultados según los equipos que tiene el usuario logueado
    results = results.filter(result =>
      filteredTeams.some(team => team.teams_id === result.id)
    );
  }

  return (
    <div>
      <Breadcrumb items={bc}/>
      <Title>Teams</Title>
      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            {isAdmin && (<ModalButton
              type={false}
              itemId={1}
              name="New Team"
              FormComponent={FormTeams}
              title={"New Team"}
            />)}
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
                        <td key={header.key}>{item[header.key]}</td>
                      ))}
                      <td className="text-end" >
                        {!isAdmin && (<Link
                          href={'/admin/teams/' + item.id + '/employees'}
                          className='btn btn-primary'
                        >Employees</Link>)}

                        {isAdmin && (<> <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Users"
                          FormComponent={UserTeams}
                          title={item.name + " : Users"}
                        />
                          <ModalButton
                            type={true}
                            itemId={item.id}
                            name="Save"
                            FormComponent={FormTeams}
                            title={"Edit : " + item.name}
                          />
                          <RemoveItem
                            url={name}
                            id={item.id}
                          /> </>)}
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