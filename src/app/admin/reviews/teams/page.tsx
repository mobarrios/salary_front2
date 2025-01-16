'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import Link from 'next/link';
import { fetchData } from '@/server/services/core/fetchData'
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';
import { formatPrice } from '@/functions/formatDate';

const ReviewTeam: React.FC = ({ id }) => {

  const { data: session, status } = useSession()
  const [totalTeams, setTotalTeams] = useState();
  const [totalReview, setTotalReview] = useState();
  const [options, setOptions] = useState();
  const [userTeams, setUserTeams] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalAssigned, setTotalAssigned] = useState(0);

  const router = useRouter();
  const [rangeValues, setRangeValues] = useState({});
  const [statusTeams, setStatusTeams] = useState({});
  const [reviewTeam, setReviewTeam] = useState({});

  const isAdmin = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'administrator');

  const handleRangeChange = async (optionId, value) => {
    const updatedRangeValues = { ...rangeValues, [optionId]: value };
    setRangeValues(updatedRangeValues);

    let total = 0;
    for (const key in updatedRangeValues) {
      total += updatedRangeValues[key];
    }
    setTotalAmount(total);
    setTotalTeams(total)
    setTotalAssigned(total)
    setTotalRemaining(totalReview - total)
  };

  const updateReviewTeams = async () => {
    const reviewTeamsResponse = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=1000`);
    const employeesWithIdOne = reviewTeamsResponse.data.filter(item => item.reviews_id === parseInt(id));

    //console.log(filteredEmployees)
    setUserTeams(employeesWithIdOne)
    setReviewTeam(employeesWithIdOne)
  }

  const userData = async () => {
    try {

      // find review
      const reviewData = await fetchData(session?.user.token, 'GET', `reviews/${id}`);
      setTotalReview(reviewData.price)

      // all teams
      const teamsData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=1000`);
     
      const userIdToFilter = session?.user.email;
     
      // todos los teams que tienen al usuario logeado
      const teamUserFilter = teamsData.data.filter(grupo =>
        grupo.users.some(user => user.email === userIdToFilter)
      );

      setOptions(teamUserFilter)
      setTotalAssigned(1)

      const reviewTeamsResponse = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=1000`);
      const employeesWithIdOne = reviewTeamsResponse.data.filter(item => item.reviews_id === parseInt(id));
      const teamIds = teamUserFilter.map(team => team.id); // Asegúrate de que `team.id` sea el campo correcto
      //console.log(teamIds)
      // Filtrar employeesWithIdOne según los team_ids
      const filteredEmployees = employeesWithIdOne.filter(employee => teamIds.includes(employee.teams_id)); // Asegúrate de que `employee.team_id` sea el campo correcto
      const updatedPercentValues = {}; // Inicializa el objeto
      
      filteredEmployees.forEach(item => {
        updatedPercentValues[`${item.teams_id}`] = item.status; // Guarda el estado
      });

      setStatusTeams(updatedPercentValues);
      setUserTeams(filteredEmployees)
      setReviewTeam(employeesWithIdOne)


    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (session?.user.token) {
      userData();
    }
  }, [id, session?.user.token]);

  useEffect(() => {
    if (userTeams) {
      const initialRangeValues = {};
      userTeams.forEach(item => {
        initialRangeValues[item.teams_id] = item.price;
      });

      setRangeValues(initialRangeValues);

      //filtrar por employees
      const total = userTeams.reduce((accumulator, item) => accumulator + item.price, 0);
      setTotalTeams(total)
      setTotalAmount(totalReview - total);
      setTotalAssigned(totalReview)
      setTotalRemaining(totalReview - total)
    }

  }, [userTeams]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  const handleCheckboxChange = async (teamId, isChecked) => {

    if (isChecked) {
      // El checkbox está marcado
      const resp = await apiRequest(`reviews_teams/`, 'POST', { reviews_id: id, teams_id: teamId, status: 1 });
      showSuccessAlert("Your work has been saved");
    } else {

      let reviewTeamId = reviewTeam.find(item => item.teams_id === parseInt(teamId));
      // El checkbox está desmarcado
      if (reviewTeamId) {
        const resp = await fetchData(session?.user.token, 'DELETE', `reviews_teams/delete/${reviewTeamId.id}`);
        showSuccessAlert("Your work has been saved");
      }
    }

    updateReviewTeams();
    router.refresh();
  };

  const handleSubmit = async (e, teamId) => {

    let reviewTeamId = reviewTeam.find(item => item.teams_id === parseInt(teamId));

    try {

      if (reviewTeamId) {
        let response = await apiRequest(`reviews_teams/edit/${reviewTeamId.id}`, 'PUT', { price: rangeValues[teamId] });
        showSuccessAlert("Your work has been saved");
      } else {
        showErrorAlert("Error")
      }

    } catch (error) {
      showErrorAlert("Error")
    }

  }

  return (
    <>
      <div className='row p-3'>
        <div className="col-12">
          <table className="table table-bordered ">
            <thead>
              <tr className="text-center">
                <td colSpan={3}>Summary</td></tr>
              <tr>
                {isAdmin && (<th>Budget Total</th>)}
                <th>Assigned</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {isAdmin && (<td>$ {totalReview ? formatPrice(totalReview) : 0} </td>)}
                <td>$ {totalTeams ? formatPrice(totalTeams) : 0} </td>
                <td>
                  $ {totalRemaining < 0 ? <b className='bg-danger'>{formatPrice(totalRemaining)}</b> : <b>{formatPrice(totalRemaining)}</b>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='col-12 mt-3'>
          <table className='table table-striped table-bordered'>
            <thead>
              <tr>
                <th>Active</th>
                <th>Team</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {options && options.map((option, index) => (

                <tr key={index}>
                  <td>
                    <div className="form-check form-switch" key={option.id}>
                      <input
                        disabled={!isAdmin}
                        className="form-check-input"
                        checked={userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id)}
                        type="checkbox"
                        role="switch"
                        name="roles_id"
                        id={option.id}
                        value={option.id}
                        onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                      />
                    </div>
                  </td>
                  <td>
                    {option.name}
                  </td>
                  <td>
                    <input
                      disabled={
                        (userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id) && isAdmin)
                          ? false
                          : true
                      }
                      type='number'
                      className='form-control'
                      value={rangeValues[option.id] || 0}
                      onChange={(e) => handleRangeChange(option.id, parseInt(e.target.value))}
                    />
                  </td>
                  <td>
                    {statusTeams[option.id] === 3 ? (
                      <span className="badge rounded-pill bg-success">Done</span>
                    ) : statusTeams[option.id] === 2 ? (
                      <span className="badge rounded-pill bg-dark">In Progress</span>
                    ) : statusTeams[option.id] === 1 ? (
                      <span className="badge rounded-pill bg-dark">In Progress</span>
                    ) : (
                      <span className="badge rounded-pill bg-danger">Not started</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      disabled={
                        (userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id) && isAdmin)
                          ? false
                          : true
                      } className='btn btn-sm btn-primary '
                      onClick={(e) => handleSubmit(e, option.id)}>
                      Save
                    </button>
                    {
                      userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id)
                        ?
                        <a
                          href={`/admin/reviews/teams/${option.id}/${id}`}
                          className="btn btn-sm btn-success ms-2">
                          Reviews
                        </a>
                        : ''
                    }
                  </td>
                </tr>

              ))}
            </tbody>
          </table>
        </div>
      </div >
    </>
  );
};

export default ReviewTeam;