'use client'

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Form from 'react-bootstrap/Form';
import { fetchData } from '@/server/services/core/fetchData'
import { apiRequest } from "@/server/services/core/apiRequest";
import ToastComponent from '@/components/ToastComponent';

const FormEmployees: React.FC = () => {

    const { id, reviews_id } = useParams();
    const { data: session, status } = useSession()
    const [team, setTeam] = useState();
    const [reviewTeam, setReviewTeam] = useState();
    const [ratings, setRatings] = useState();
    const [rangeValues, setRangeValues] = useState({});
    const [ratingsTeamEmployees, setRatingsTeamEmployees] = useState({});
    const [commnetsValues, setCommnetsValues] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    //const employees
    const [currentBase, setCurrentBase] = useState(150000);
    const [totalValueByEmployee, setTotalValueByEmployee] = useState({});
    const [totalPercentByEmployee, setTotalPercentByEmployee] = useState({});
    const router = useRouter();

    //const team
    const [totalTeam, setTotalTeam] = useState();
    const [totalPercent, setTotalPercent] = useState();
    const [totalRemaining, setTotalRemaining] = useState(0);

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
                // Asegúrate de que si el total es 0, se refleje correctamente
                valuesByEmployeeWithPercentage[key] = calculatePorcentaje(employeeTotals[key]);
            }
            setTotalPercentByEmployee(valuesByEmployeeWithPercentage);
    
            // Actualiza totalPercent basado en los nuevos valores
            const totalSpend = Object.values(valuesByEmployeeWithPercentage).reduce((acc, value) => acc + value, 0);
            setTotalPercent(totalSpend);
    
            return updatedRangeValues;
        });
    };

    const calcularTotalRemaining = () => {
        const total = (reviewTeam?.price || 0) - (totalTeam || 0);
        return total
    }

    const calculatePorcentaje = (value) => {
        return currentBase * value / 100;
    }

    const calculateTotalPrice = (updatedRangeValues) => {
        let totalPrice = 0;
        for (const key in updatedRangeValues) {
            //const [currentRatingsId, currentEmployeeId] = key.split('-');
            const currentValue = parseInt(updatedRangeValues[key], 10);

            //employeeTotals[currentEmployeeId] += currentValue;
            totalPrice += currentValue;
        }
        return { totalPrice };
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
        const updatePriceValues = {};

        data.forEach(item => {
            updatedRangeValues[`${item.ratings_id}-${item.employees_id}`] = item.percent;
            updateCommentsValues[`${item.ratings_id}-${item.employees_id}`] = item.comments;
            updatePriceValues[`${item.ratings_id}-${item.employees_id}`] = item.price;
        });


        const { employeeTotals, total } = calculateTotalsByEmployee(updatedRangeValues);
        const { totalPrice } = calculateTotalPrice(updatePriceValues);
    
        // Actualizar el total propuesto inicial
        setTotalTeam(total);
        setTotalValueByEmployee(employeeTotals);
        setTotalPercent(totalPrice);

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
            const teamReview = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=1000`);

            // filter team review
            const filteredData = teamReview.data.filter(item => item.teams_id == id && item.reviews_id == reviews_id);
            setReviewTeam(filteredData[0])

            // ratings
            const ratingsResponse = await fetchData(session?.user.token, 'GET', `ratings/all/?skip=0&limit=1000`);
            setRatings(ratingsResponse.data);

            //all review teams employees
            const reviewTeamEmployeesResponse = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=100`);

            // filter rating y employees
            const filterRatingEmployees = reviewTeamEmployeesResponse.data.filter(item => item.teams_id == id && item.reviews_id == reviews_id);

            setRatingsTeamEmployees(filterRatingEmployees);
            updateRatingsEmployees(filterRatingEmployees);

            // calcular total remaining

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (session?.user.token) {
            load();
        }

    }, [id, session?.user.token]);

    
    useEffect(() => {
        if (reviewTeam && totalTeam) {
            const total = (reviewTeam.price || 0) - (totalPercent || 0);
            setTotalRemaining(total)

            const totalSum = Object.values(totalPercentByEmployee).reduce((acc, value) => acc + value, 0);
            setTotalPercent(totalSum);
            console.log(totalPercent)
          
        }
    }, [reviewTeam, totalTeam]);

    const handleCheckboxChange = async (optionId, employeesId, isChecked) => {
        setShowToast(false);

        const values = {
            reviews_id: reviews_id,
            teams_id: id,
            employees_id: employeesId,
            ratings_id: optionId,
            price: null,
            percent: null,
            comments: null,
            status: 1
        };

        if (isChecked) {

            // El checkbox está marcado
            const response = await apiRequest(`reviews_teams_employees/`, 'POST', values);
            console.log('El checkbox está marcado', optionId, employeesId, isChecked);
            console.log(response)
            setShowToast(true);
            setToastMessage('Update successful');

        } else {

            let reviewTeamEmployeesId = ratingsTeamEmployees.find(item =>
                item.reviews_id == parseInt(reviews_id) &&
                item.employees_id == parseInt(employeesId) &&
                item.ratings_id == parseInt(optionId) &&
                item.teams_id == parseInt(id)
            );

            if (reviewTeamEmployeesId) {
                console.log(reviewTeamEmployeesId.id);
                // El checkbox está desmarcado
                const response = await fetchData(session?.user.token, 'DELETE', `reviews_teams_employees/delete/${reviewTeamEmployeesId.id}`);
                console.log('El checkbox está desmarcado', optionId, employeesId, isChecked);
                console.log(response);
                setShowToast(true);
                setToastMessage('Update successful');

                // Eliminar el elemento del estado ratingsTeamEmployees
                const filteredRatingsTeamEmployees = ratingsTeamEmployees.filter(item =>
                    item.id !== reviewTeamEmployeesId.id
                );

                //updateRatingsEmployees()
                setRatingsTeamEmployees(filteredRatingsTeamEmployees);
                updateRatingsEmployees(filteredRatingsTeamEmployees);

            } else {
                console.log('No se encontró el elemento para desmarcar');
            }
        }

        load();
        router.refresh();

    };

    const handleSubmit = async (e, employeesId, ratingsId) => {
        setShowToast(false);
        const percent = rangeValues[`${ratingsId}-${employeesId}`];
        const comment = commnetsValues[`${ratingsId}-${employeesId}`];
        const price = currentBase * percent / 100;

        const reviewTeamEmployeesId = ratingsTeamEmployees.find(item =>
            item.reviews_id == parseInt(reviews_id) &&
            item.employees_id == employeesId &&
            item.ratings_id == ratingsId &&
            item.teams_id == parseInt(id)
        );

        try {
            const values = {
                reviews_id: reviews_id,
                teams_id: id,
                employees_id: employeesId,
                ratings_id: ratingsId,
                price: price,
                percent: percent,
                status: 1,
                comments: comment
            };

            const response = await apiRequest(`reviews_teams_employees/edit/${reviewTeamEmployeesId.id}`, 'PUT', values);
            console.log(response);
            setShowToast(true);
            setToastMessage('Update successful');
        } catch (error) {
            console.error('Error updating:', error);
        }
    }

    const isCheckboxChecked = (optionId, itemId) => {
        return ratingsTeamEmployees && ratingsTeamEmployees.length > 0 && ratingsTeamEmployees.some(item => item.ratings_id == optionId && item.employees_id == itemId);
    };


    return (
        <div className="row">
            {showToast ?
                <ToastComponent showToast={showToast} message={toastMessage} />
                : null}
            <div className='col-12'>
                <h3 className='text-primary mb-5'>Reviews - {team?.name}</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Total amount to assign</th>
                            <th>Total percent</th>
                            <th>Total Spend</th>
                            <th>Total Remaining</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td> <strong>$ {reviewTeam ? reviewTeam?.price.toFixed(2) : 0}</strong></td>
                            <td>% {totalTeam ? totalTeam : 0}</td>
                            <td> $ {totalPercent ? totalPercent : 0}</td>
                            <td> $ {totalRemaining ? totalRemaining : 0}</td>
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
                                            <td>$ {currentBase ? currentBase : 0}</td>
                                            <td>$ {totalValueByEmployee[item.id] ? totalValueByEmployee[item.id] : 0}</td>
                                            <td>$ {totalPercentByEmployee[item.id] ? totalPercentByEmployee[item.id] : 0}</td>
                                            <td>$ 0</td>
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
                                                            checked={isCheckboxChecked(option.id, item.id)}
                                                            type="checkbox"
                                                            role="switch"
                                                            name="roles_id"
                                                            id={option.id}
                                                            value={option.id}
                                                            onChange={(e) => handleCheckboxChange(option.id, item.id, e.target.checked)}
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
                                                                disabled={!isCheckboxChecked(option.id, item.id)}
                                                                step={1}
                                                                min={option.percent_min}
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
                                                        disabled={!isCheckboxChecked(option.id, item.id)}
                                                        type="text"
                                                        placeholder="Comments"
                                                        value={commnetsValues[`${option.id}-${item.id}`]}
                                                        onChange={(e) => {
                                                            const newCommnetsValues = { ...commnetsValues };
                                                            newCommnetsValues[`${option.id}-${item.id}`] = e.target.value;
                                                            setCommnetsValues(newCommnetsValues);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        disabled={!isCheckboxChecked(option.id, item.id)}
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