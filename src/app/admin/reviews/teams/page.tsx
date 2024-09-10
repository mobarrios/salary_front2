'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import Link from 'next/link';
import { fetchData } from '@/server/services/core/fetchData'
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';

const ReviewTeam: React.FC = ({id}) => {

  const { data: session, status } = useSession()
  const [totalTeams, setTotalTeams] = useState();
  const [totalReview, setTotalReview] = useState();
  const [options, setOptions] = useState();
  const [userTeams, setUserTeams] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const router = useRouter();
  const [rangeValues, setRangeValues] = useState({});
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
    setTotalRemaining(totalReview - total)
  };

  const updateReviewTeams = async () => {
    const reviewTeamsResponse = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=1000`);

    const employeesWithIdOne = reviewTeamsResponse.data.filter(item => item.reviews_id === parseInt(id));
  
    setUserTeams(employeesWithIdOne)
    setReviewTeam(employeesWithIdOne)
  }

  const userData = async () => {
    try {

      const reviewData = await fetchData(session?.user.token, 'GET', `reviews/${id}`);
      setTotalReview(reviewData.price)

      const teamsData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=10`);
      console.log(teamsData)
      // user por teams
      const usersTeamsResponse = await fetchData(session?.user.token, 'GET', `teams_users/all/?skip=0&limit=100`);
      console.log(usersTeamsResponse)

      setOptions(teamsData.data)

      updateReviewTeams()

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
      const total = userTeams.reduce((accumulator, item) => accumulator + item.price, 0);
      setTotalTeams(total)
      setTotalAmount(total);
      setTotalRemaining(totalReview - total)
    }

  }, [userTeams]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  const handleCheckboxChange = async (teamId, isChecked) => {
   
    if (isChecked) {
      // El checkbox está marcado
      const resp = await apiRequest(`reviews_teams/`, 'POST', { reviews_id: id, teams_id: teamId });
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
    setShowToast(false);
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
        <table className="table ">
          <thead>
            <tr className="text-center">
             <td colSpan={3}>Resume</td></tr>
            <tr>
              <th>Budget Total</th>
              <th>Asigned</th>
              <th>Remaining</th>
            </tr>  
          </thead>
          <tbody>
            <tr>
              <td>$ {totalReview ? totalReview.toFixed(2) : 0} </td>
              <td>$ {totalReview ? totalReview.toFixed(2) : 0} </td>
              <td>
                $ {totalRemaining < 0 ? <b className='bg-danger'>{totalRemaining?.toFixed(2)}</b>: <b>{totalRemaining?.toFixed(2)}</b>}
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <div className='col-12 mt-3'>
          <table className='table table-hover '>
            <thead>
              <tr>
                <th>Active</th>
                <th>Team</th>
                <th>Amount</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {options && options.map((option, index) => (

                <tr key={index}>
                  <td>
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

                    </div>
                  </td>
                  <td>
                      {option.name}
                  </td>
                  <td>   
                      <input
                        disabled={userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id) ? false : true}
                        type='number'
                        className='form-control'
                        value={rangeValues[option.id] || 0}
                        onChange={(e) => handleRangeChange(option.id, parseInt(e.target.value))}

                      />
                  </td>
                  <td className="text-center">
                      <button
                        disabled={userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id) ? false : true}
                        //disabled={totalRemaining < 0}
                        className='btn btn-light btn-xs'
                        onClick={(e) => handleSubmit(e, option.id)}>
                        <i className="bi bi-arrow-clockwise"></i>
                      </button>
                       {
                          userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id)
                          ?
                        <a
                          href={`/admin/reviews/teams/${option.id}/${id}`}
                          className="btn btn-success ms-2">
                          <i className="bi bi-pencil"></i> 
                        </a>
                        : ''
                    }
                  </td>
                </tr>

              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ReviewTeam;