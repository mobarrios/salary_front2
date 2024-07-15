'use client'

import React, { useState, useEffect } from "react";
import { Params } from '@/types/params';
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import Form from 'react-bootstrap/Form';
import { fetchData } from '@/server/services/core/fetchData'

const FormEmployees: React.FC = () => {

    const { id, team_id } = useParams();
    const { data: session, status } = useSession()
    const [team, setTeam] = useState();
    const [reviewTeam, setReviewTeam] = useState();
    const [ratings, setRatings] = useState();

    const load = async () => {
        try {
            const teamResponse = await fetchData(session?.user.token, 'GET', `teams/${id}`);
            setTeam(teamResponse[0]);

            const teamReview = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=10`);
            console.log(teamReview)
            const filteredData = teamReview.data.filter(item => item.teams_id == id && item.reviews_id == team_id);
            console.log(setReviewTeam(filteredData[0]));

            const ratingsResponse = await fetchData(session?.user.token, 'GET', `ratings/all/?skip=0&limit=10`);
            setRatings(ratingsResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (session?.user.token) {

            load();

        }

    }, [id, session?.user.token]);

    const handleCheckboxChange = async (teamId, isChecked) => {
        /*
        const updatedRoles = isChecked
          ? [...userTeams, { teams_id: teamId }]
          : userTeams.filter(team => team.teams_id !== teamId);
        setUserTeams(updatedRoles);
        */

        if (isChecked) {
            // El checkbox está marcado
            //const response = await apiRequest(`teams_employees/`, 'POST', { employees_id: id, teams_id: teamId });
            console.log('El checkbox está marcado');
        } else {
            // El checkbox está desmarcado
            /*
            const response = await fetch(process.env.NEXT_PUBLIC_SALARY + `/teams_employees/delete/${teamId}/${id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user.token}`
              },
            });
            
            const data = await response.json();
            console.log(data);
            */
            console.log('El checkbox está desmarcado');
        }
        //router.refresh();
    };


    return (
        <div className="row">
            <div className='col-12'>
                <h3 className='text-primary mb-5'>Reviews - {team?.name}</h3>
                <table className="table">
                    <thead>
                        <th>Total amount to assign</th>
                        <th>Total Spend</th>
                        <th>Total Remaining</th>

                    </thead>
                    <tbody>
                        <tr>
                            <td> <strong>$ {reviewTeam?.price.toFixed(2)}</strong></td>
                            <td> $ 10.00</td>
                            <td> $ 40.200</td>

                        </tr>
                    </tbody>
                </table>

            </div>
            {
                team && team.employees.map((item, rowIndex) => (
                    <div key={rowIndex} className="mt-1 ">
                        <p>
                            <a data-bs-toggle="collapse" href={`#employees-${rowIndex}`} role="button" aria-expanded="false" aria-controls={`employees-${rowIndex}`}>
                                <span className="text-uppercase"># {item.id} -   {item.name} {item.last_name}</span>
                            </a>
                        </p>
                        <div className="collapse" id={`employees-${rowIndex}`}>
                            <div className="card card-body">
                                <table className="table">
                                    <thead>
                                        <th>Current Base Annual Salary</th>
                                        <th>Proposed Total Increase %</th>
                                        <th>Proposed Total Increase $</th>
                                        <th>Proposed New Base Hourly Rate</th>
                                        <th>Proposed New Base Annual Salary</th>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>$ 150.000</td>
                                            <td>% 16</td>
                                            <td>$ 24.000</td>
                                            <td>$ 12.00</td>
                                            <td>$ 50.200</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table>
                                    {ratings && ratings.map((option) => (
                                        <tr className="mt-2">
                                            <td className="text-center">
                                                <div className="form-check form-switch" key={option.id}>
                                                    <input
                                                        className="form-check-input"
                                                        //ratingschecked={userTeams && userTeams.length > 0 && userTeams.some(item => item.teams_id === option.id)}
                                                        type="checkbox"
                                                        role="switch"
                                                        name="roles_id"
                                                        id={option.id}
                                                        value={option.id}
                                                        onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                                                    />
                                                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{option.name}  </label>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <div className="row ">
                                                    <div className="col-2" ><small>{option.percent_min} %</small></div>
                                                    <div className="col-8"><Form.Range min={option.percent_min} max={option.percent_max} /></div>
                                                    <div className="col-2"><small>{option.percent_max} %</small></div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <input type="text" placeholder="Comments" />
                                            </td>
                                        </tr>
                                    ))}
                                </table>
                            </div>
                        </div>
                    </div>
                ))
            }

        </div>
    )
};

export default FormEmployees;