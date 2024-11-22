'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import { fetchData } from '@/server/services/core/fetchData'
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';

const FormEmployeesTeams: React.FC = ({id}) => {

  const { data: session, status } = useSession()
  const [options, setOptions] = useState();
  const [loading, setLoading] = useState(false);
  const [userTeams, setUserTeams] = useState();
  const router = useRouter()

  const userData = async () => {
    try {
      
      const jsonData = await fetchData(session?.user.token, 'GET', `teams_employees/all/?skip=0&limit=1000`);
      const employeesWithIdOne = jsonData.data.filter(item => item.employees_id === parseInt(id));
      setUserTeams(employeesWithIdOne)

    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  const load = async () => {
    try {
      setLoading(true)
      const jsonData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=100`);
      setOptions(jsonData.data)

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    if (session?.user.token) {
      userData();
      load();
    }

  }, [id, session?.user.token]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  const handleCheckboxChange = async (teamId, isChecked) => {
    const updatedRoles = isChecked
      ? [...userTeams, { teams_id: teamId }]
      : userTeams.filter(team => team.teams_id !== teamId);
    setUserTeams(updatedRoles);

    if (isChecked) {
      // El checkbox está marcado
      const response = await apiRequest(`teams_employees/`, 'POST', { employees_id: id, teams_id: teamId });
      showSuccessAlert("Your work has been saved");

   
    } else {
      // El checkbox está desmarcado
      const jsonData = await fetchData(session?.user.token, 'DELETE', `teams_employees/delete/${teamId}/${id}`);
      showSuccessAlert("Your work has been deleted");

    }
    router.refresh();
  };

  return (
    <div className="row m-2">
      <div className='col-12'>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          options && options.map((option) => (
            <div className="row form-check form-switch mt-2"  key={option.id}>
              <div className="col-2">
              <input
                className="form-check-input"
                checked={Array.isArray(userTeams) && userTeams.some(item => item.teams_id === option.id)}
                type="checkbox"
                role="switch"
                name="roles_id"
                id={option.id}
                value={option.id}
                onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
              />
              </div>
              <div className="col-10 ms-3 ">
              <label className="form-check-label" htmlFor={option.id}>{option.name}</label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FormEmployeesTeams;