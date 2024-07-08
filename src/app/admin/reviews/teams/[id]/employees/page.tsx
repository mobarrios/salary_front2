'use client'

import React, { useState, useEffect } from "react";
import { Params } from '@/types/params';
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import Form from 'react-bootstrap/Form';

const FormEmployees: React.FC = () => {

    const { id } = useParams();
    const { data: session, status } = useSession()
    const [team, setTeam] = useState();
    const [ratings, setRatings] = useState();

    const fetchData = async () => {
        try {
            const teamResponse = await fetch(process.env.NEXT_PUBLIC_SALARY + `/teams/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.user.token}`
                },
            });
            const teamData = await teamResponse.json();
            setTeam(teamData[0]);

            const ratingsResponse = await fetch(process.env.NEXT_PUBLIC_SALARY + `/ratings/all/?skip=0&limit=10`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.user.token}`
                },
            });
            const ratingsData = await ratingsResponse.json();
            setRatings(ratingsData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (session?.user.token) {

            fetchData();
            console.log(ratings)
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
                                    <td> <strong>$ 50.200</strong></td>
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
                                                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{option.name} - {option.percent}%  </label>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <Form.Range min={0} max={option.percent} />
                                            </td>
                                            <td className="text-center">
                                                <input type="text" placeholder="Comments"/>
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