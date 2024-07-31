'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import Link from 'next/link';
import Form from 'react-bootstrap/Form';
import { fetchData } from '@/server/services/core/fetchData'
import ToastComponent from '@/components/ToastComponent';

const FormEmployees: React.FC = () => {

  const { data: session, status } = useSession()
  const [totalTeams, setTotalTeams] = useState();
  const [totalReview, setTotalReview] = useState();
  const [options, setOptions] = useState();
  const [userTeams, setUserTeams] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { id } = useParams();
  const router = useRouter()
  const [rangeValues, setRangeValues] = useState({});

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

  const userData = async () => {
    try {

      const reviewData = await fetchData(session?.user.token, 'GET', `reviews/${id}`);
      setTotalReview(reviewData.price)

      const jsonData = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=10`);

      const employeesWithIdOne = jsonData.data.filter(item => item.reviews_id === parseInt(id));
      setUserTeams(employeesWithIdOne)

      const teamsData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=10`);
      setOptions(teamsData.data)

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
    setShowToast(false);

    const updatedRoles = isChecked
      ? [...userTeams, { teams_id: teamId }]
      : userTeams.filter(team => team.teams_id !== teamId);

    setUserTeams(updatedRoles);

    if (isChecked) {

      // El checkbox está marcado
      const response = await apiRequest(`reviews_teams/`, 'POST', { reviews_id: id, teams_id: teamId });
      console.log('El checkbox está marcado', response);
      setShowToast(true);
      setToastMessage('Update successful');

    } else {

      const reviewTeam = userTeams.find(item =>
        item.reviews_id == parseInt(id) &&
        item.teams_id == parseInt(teamId)
      );

      console.log(reviewTeam.id, teamId, id, userTeams)

      // El checkbox está desmarcado
      if (reviewTeam) {
        const response = await fetchData(session?.user.token, 'DELETE', `reviews_teams/delete/${reviewTeam.id}`);
        console.log('El checkbox está desmarcado', response);
        setShowToast(true);
        setToastMessage('Update successful');
      } 

    }
    router.refresh();
  };

  const handleSubmit = async (e, teamId) => {
    setShowToast(false);
    const reviewItemsId = userTeams.find(item => item.reviews_id == id && item.teams_id == teamId);
   
    try {

      if (reviewItemsId) {
        const response = await apiRequest(`reviews_teams/edit/${reviewItemsId.id}`, 'PUT', { price: rangeValues[teamId] });
        setShowToast(true);
        setToastMessage('Update successful'); // Mensaje de éxito
      } else {
        console.error('Error updating:', error);
      }

    } catch (error) {
      setShowToast(true);
      setToastMessage('Error updating'); // Mensaje de error
      console.error('Error updating:', error);
    }

  }

  return (
    <>
      <div className='row mt-5'>
        {showToast ?
          <ToastComponent showToast={showToast} message={toastMessage} />
          : null}
        <div className='col-12'>
          <table className='table '>
            {options && options.map((option) => (
              <tbody>
                <tr>
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

                      {
                        userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id)
                          ?
                          <Link
                            href={`/admin/reviews/teams/${option.id}/employees/${id}`}
                            className="form-check-label btn btn-success">
                            {option.name}
                          </Link>
                          : <label className="form-check-label btn " htmlFor="flexSwitchCheckDefault">{option.name}</label>
                      }
                    </div>
                  </td>
                  <td>
                    $ <b>{rangeValues[option.id] || 0}</b>
                    <div className="col-4">

                      <Form.Range
                        disabled={userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id) ? false : true}
                        step={1000}
                        min={0}
                        max={totalReview}
                        value={rangeValues[option.id] || 0}
                        onChange={(e) => handleRangeChange(option.id, parseInt(e.target.value))}
                      />

                    </div>
                  </td>
                  <td>
                    <div className="col-2">
                      <button
                        disabled={totalRemaining < 0}
                        className='btn btn-primary btn-xs'
                        onClick={(e) => handleSubmit(e, option.id)}>
                        <i className="bi bi-update"></i>  update
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            ))}

            <tr>
              <td>

                <h6>Total amount : $<b>{totalReview ? totalReview.toFixed(2) : 0}</b> </h6>
                <h6>Total team  : $<b>{totalAmount ? totalAmount.toFixed(2) : 0}</b> </h6>

                {totalRemaining < 0 ?
                  <h6 className='text-danger'>Total Remaining  : $<b>{totalRemaining?.toFixed(2)}</b> </h6>
                  : <h6 >Total Remaining  : $<b>{totalRemaining?.toFixed(2)}</b> </h6>
                }
              </td>
            </tr>
          </table>
        </div>
      </div>
    </>
  );
};

export default FormEmployees;