'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';

const FormEmployees: React.FC = () => {

  const { data: session, status } = useSession()
  const [options, setOptions] = useState();
  const [userTeams, setUserTeams] = useState();
  const { id } = useParams();
  const router = useRouter()


  const userData = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SALARY + `/reviews_teams/all/?skip=0&limit=10`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.user.token}`
        },
      });
      const jsonData = await response.json();
      const employeesWithIdOne = jsonData.data.filter(item => item.reviews_id === parseInt(id));
      console.log(employeesWithIdOne)
      setUserTeams(employeesWithIdOne)

    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      ///api/v1/roles/all/?skip=0&limit=5
      const response = await fetch(process.env.NEXT_PUBLIC_SALARY + `/teams/all/?skip=0&limit=10`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.user.token}`
        },
      });
      const jsonData = await response.json();
      setOptions(jsonData.data)


    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (session?.user.token) {
      userData();
      fetchData();
      console.log(userTeams)
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
      const response = await apiRequest(`reviews_teams/`, 'POST', { reviews_id: id, teams_id: teamId });
      console.log(response)
      console.log('El checkbox está marcado');
    } else {
      // El checkbox está desmarcado
      const response = await fetch(process.env.NEXT_PUBLIC_SALARY + `/reviews_teams/delete/${teamId}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user.token}`
        },
      });
      const data = await response.json();
      console.log(data);
      console.log('El checkbox está desmarcado');
    }
    router.refresh();
  };

  return (
    <div className="row">
      <div className='col-12'>
        <h1 className='text-primary'>Reviews Teams</h1>
      </div>
      <div className='col-12'>


        {options && options.map((option) => (
          <div className="form-check form-switch" key={option.id}>
            <input
              className="form-check-input"
              checked={userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id)}
              type="checkbox"
              role="switch"
              name="roles_id"
              id={option.id}
              value={option.id}
              onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}

            />
            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{option.name}</label>
          </div>
        ))}

      </div>
    </div>

  );
};

export default FormEmployees;