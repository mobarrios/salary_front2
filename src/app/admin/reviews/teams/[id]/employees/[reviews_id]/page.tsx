'use client'

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import Form from 'react-bootstrap/Form';
import { fetchData } from '@/server/services/core/fetchData'
import { apiRequest } from "@/server/services/core/apiRequest";

const FormEmployees: React.FC = () => {

    const { id, reviews_id } = useParams();
    const { data: session, status } = useSession()
    const [team, setTeam] = useState();
    const [reviewTeam, setReviewTeam] = useState();
    const [ratings, setRatings] = useState();
    const [rangeValues, setRangeValues] = useState({});
    const [ratingsTeamEmployees, setRatingsTeamEmployees] = useState({});
    const [commnetsValues, setCommnetsValues] = useState({});

    //const employees
    const [currentBase, setCurrentBase] = useState(150000);
    const [totalValueByEmployee, setTotalValueByEmployee] = useState({});
    const [totalPercentByEmployee, setTotalPercentByEmployee] = useState({});

    //const team
    const [totalTeam, setTotalTeam] = useState();

    const handleRangeChange = (e, ratingsId, employeeId) => {
        const value = parseInt(e.target.value, 10); // Asegúrate de que el valor sea un número
        setRangeValues(prevState => {
            const updatedRangeValues = {
                ...prevState,
                [`${ratingsId}-${employeeId}`]: value
            };
            // Calcular los totales por employeeId
            const { employeeTotals, total } = calculateTotalsByEmployee(updatedRangeValues);

            // Actualizar el total propuesto y el estado con los valores actualizados
            setTotalTeam(total);
            setTotalValueByEmployee(employeeTotals);

            // Calcular y guardar los valores por ID utilizando el porcentaje
            const valuesByEmployeeWithPercentage = {};
            for (const key in employeeTotals) {
                valuesByEmployeeWithPercentage[key] = calculatePorcentaje(employeeTotals[key]);
            }
            setTotalPercentByEmployee(valuesByEmployeeWithPercentage);

            return updatedRangeValues;
        });
    };

    const calculatePorcentaje = (value) => {
        return currentBase * value / 100;
    }

    const calculateTotalsByEmployee = (updatedRangeValues) => {
        const employeeTotals = {};
        let total = 0;
        for (const key in updatedRangeValues) {
            const [currentRatingsId, currentEmployeeId] = key.split('-');
            const currentValue = parseInt(updatedRangeValues[key], 10);
            if (!employeeTotals[currentEmployeeId]) {
                employeeTotals[currentEmployeeId] = 0;
            }
            employeeTotals[currentEmployeeId] += currentValue;
            total += currentValue;
        }
        return { employeeTotals, total };
    };

    const updateRatingsEmployees = (data) => {

        const updatedRangeValues = {};
        const updateCommentsValues = {};

        data.forEach(item => {
            updatedRangeValues[`${item.ratings_id}-${item.employees_id}`] = item.price;
            updateCommentsValues[`${item.ratings_id}-${item.employees_id}`] = item.commnets;
        });


        const { employeeTotals, total } = calculateTotalsByEmployee(updatedRangeValues);

        // Actualizar el total propuesto inicial
        setTotalTeam(total);
        setTotalValueByEmployee(employeeTotals);

        // Actualizar porcentaje inicial
        const valuesByEmployeeWithPercentage = {};
        for (const key in employeeTotals) {
            valuesByEmployeeWithPercentage[key] = calculatePorcentaje(employeeTotals[key]);
        }
        setTotalPercentByEmployee(valuesByEmployeeWithPercentage);

        setRangeValues(prevState => ({
            ...prevState,
            ...updatedRangeValues
        }));

        setCommnetsValues(prevState => ({
            ...prevState,
            ...updateCommentsValues
        }));

    }

    const load = async () => {
        try {
            // team
            const teamResponse = await fetchData(session?.user.token, 'GET', `teams/${id}`);
            setTeam(teamResponse[0]);

            // all team review
            const teamReview = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=10`);
            const filteredData = teamReview.data.filter(item => item.teams_id == id && item.reviews_id == reviews_id);
            setReviewTeam(filteredData[0])

            // ratings
            const ratingsResponse = await fetchData(session?.user.token, 'GET', `ratings/all/?skip=0&limit=10`);
            setRatings(ratingsResponse.data);

            //all review teams employees
            const reviewTeamEmployeesResponse = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=10`);

            // filter rating y employees
            const filterRatingEmployees = reviewTeamEmployeesResponse.data.filter(item => item.teams_id == id && item.reviews_id == reviews_id);
            setRatingsTeamEmployees(filterRatingEmployees);

            updateRatingsEmployees(filterRatingEmployees);


        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (session?.user.token) {
            load();
        }

    }, [id, session?.user.token]);



    const handleSubmit = async (e, employeeId, ratingsId) => {

        const percent = rangeValues[`${ratingsId}-${employeeId}`];
        const comment = commnetsValues[`${ratingsId}-${employeeId}`];
        const price = currentBase * percent / 100;

        console.log(price, percent, employeeId, ratingsId)
        try {
            const values = {
                reviews_id: reviews_id,
                teams_id: id,
                employees_id: employeeId,
                ratings_id: ratingsId,
                price: price,
                percent: percent,
                status: 1,
                comments: comment
            };
            console.log(values)
            //const response = await apiRequest(`reviews_teams_employees/`, 'POST', values);
            //setToastMessage('Update successful'); // Mensaje de éxito
            //setShowToast(true); // Mostrar el toast
            //console.log(response);
        } catch (error) {
            //setToastMessage('Error updating'); // Mensaje de error
            //setShowToast(true); // Mostrar el toast
            console.error('Error updating:', error);
        }
    }


    return (
        <div className="row">
            <div className='col-12'>
                <h3 className='text-primary mb-5'>Reviews - {team?.name}</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Total amount to assign</th>
                            <th>Total Spend</th>
                            <th>Total Remaining</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td> <strong>$ {reviewTeam?.price.toFixed(2)}</strong></td>
                            <td> $ {totalTeam}</td>
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
                                <span className="text-uppercase"># {item.id} - {item.name} {item.last_name}</span>
                            </a>
                        </p>
                        <div className="collapse" id={`employees-${rowIndex}`}>
                            <div className="card card-body">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Current Base Annual Salary</th>
                                            <th>Proposed Total Increase %</th>
                                            <th>Proposed Total Increase $</th>
                                            <th>Proposed New Base Hourly Rate</th>
                                            <th>Proposed New Base Annual Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>$ {currentBase}</td>
                                            <td>$ {totalValueByEmployee[item.id]}</td>
                                            <td>$ {totalPercentByEmployee[item.id]}</td>
                                            <td>$ 50.200</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table>
                                    <tbody>
                                        {ratings && ratings.map((option, key) => (
                                            <tr className="mt-2" key={key}>
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
                                                        //onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                                                        />
                                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{option.name}  </label>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="row ">
                                                        <div className="col-2">
                                                            <small>{option.percent_min} %</small>
                                                        </div>
                                                        <div className="col-8">
                                                            <Form.Range
                                                                step={1}
                                                                minLength={option.percent_min}
                                                                maxLength={option.percent_max}
                                                                min={0}
                                                                max={option.percent_max}
                                                                value={rangeValues[`${option.id}-${item.id}`] || 0}
                                                                onChange={(e) => handleRangeChange(e, option.id, item.id)}
                                                            />
                                                        </div>
                                                        <div className="col-2"><small>{option.percent_max} %</small> {rangeValues[`${option.id}-${item.id}`] || 0}</div>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Comments"
                                                        value={commnetsValues[`${option.id}-${item.id}`]} // Asegúrate de manejar el valor nulo o indefinido
                                                        onChange={(e) => {
                                                            const newCommnetsValues = { ...commnetsValues };
                                                            newCommnetsValues[`${option.id}-${item.id}`] = e.target.value;
                                                            setCommnetsValues(newCommnetsValues);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        //disabled={totalRemaining < 0}
                                                        className='btn btn-primary btn-xs'
                                                        onClick={(e) => handleSubmit(e, item.id, option.id)}
                                                    >
                                                        <i className="bi bi-update"></i>  update
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
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