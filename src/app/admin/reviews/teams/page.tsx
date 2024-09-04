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
    console.log(reviewTeamsResponse)
    const employeesWithIdOne = reviewTeamsResponse.data.filter(item => item.reviews_id === parseInt(id));
    console.log(employeesWithIdOne)
    setUserTeams(employeesWithIdOne)
    setReviewTeam(employeesWithIdOne)
  }

  const userData = async () => {
    try {

      const reviewData = await fetchData(session?.user.token, 'GET', `reviews/${id}`);
      setTotalReview(reviewData.price)

      const teamsData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=10`);
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
      console.log(resp)
    } else {

      let reviewTeamId = reviewTeam.find(item => item.teams_id === parseInt(teamId));
      console.log(reviewTeamId)
      // El checkbox está desmarcado
      if (reviewTeamId) {
        const resp = await fetchData(session?.user.token, 'DELETE', `reviews_teams/delete/${reviewTeamId.id}`);
        console.log(resp)
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

        console.log(response)
      } else {
        showErrorAlert("Error")
      }

    } catch (error) {
      showErrorAlert("Error")
    }

  }

  return (
    <>
      <div className='row mt-5'>
        <div className='col-12'>
          <table className='table '>
            <thead>
              <tr>
                <th>Active</th>
                <th>Team</th>
                <th>Amount</th>
                <th>Acciones</th>

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

                    {
                      userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id)
                        ?
                        <Link
                          //href={`/admin/reviews/teams/${option.id}/employees/${id}`}
                          href={`/admin/reviews/teams/${option.id}/${id}`}
                          className="form-check-label btn btn-success">
                          {option.name}
                        </Link>
                        : <label className="form-check-label btn " htmlFor="flexSwitchCheckDefault">{option.name}</label>
                    }

                  </td>
                  <td>

                    <div className="col-4">

                      <input
                        disabled={userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id) ? false : true}
                        type='number'
                        className='form-control'
                        value={rangeValues[option.id] || 0}
                        onChange={(e) => handleRangeChange(option.id, parseInt(e.target.value))}

                      />

                      {/* <Form.Range
                        disabled={userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id) ? false : true}
                        step={1000}
                        min={0}
                        max={totalReview}
                        value={rangeValues[option.id] || 0}
                        onChange={(e) => handleRangeChange(option.id, parseInt(e.target.value))}
                      /> */}
                    </div>
                  </td>
                  <td>
                    <div className="col-2">
                      <button
                        disabled={userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id) ? false : true}
                        //disabled={totalRemaining < 0}
                        className='btn btn-primary btn-xs'
                        onClick={(e) => handleSubmit(e, option.id)}>
                        <i className="bi bi-update"></i>  update
                      </button>
                    </div>
                  </td>
                </tr>

              ))}

              <tr>
                <td colSpan={5}>

                  <h6>Total amount : $<b>{totalReview ? totalReview.toFixed(2) : 0}</b> </h6>
                  <h6>Total team  : $<b>{totalAmount ? totalAmount.toFixed(2) : 0}</b> </h6>

                  {totalRemaining < 0 ?
                    <h6 className='text-danger'>Total Remaining  : $<b>{totalRemaining?.toFixed(2)}</b> </h6>
                    : <h6 >Total Remaining  : $<b>{totalRemaining?.toFixed(2)}</b> </h6>
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ReviewTeam;