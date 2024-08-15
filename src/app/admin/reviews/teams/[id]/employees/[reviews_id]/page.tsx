'use client'

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Form from 'react-bootstrap/Form';
import { fetchData } from '@/server/services/core/fetchData'
import { apiRequest } from "@/server/services/core/apiRequest";
import ToastComponent from '@/components/ToastComponent';
import { item } from "@/types/item";

const FormEmployees: React.FC = () => {

    const { id, reviews_id } = useParams();
    const { data: session, status } = useSession()
    const [team, setTeam] = useState();
    const [teamEmployees, setTeamEmployees] = useState();
    const [reviewTeam, setReviewTeam] = useState();
    const [ratings, setRatings] = useState();
    const [rangeValues, setRangeValues] = useState({});
    const [ratingsTeamEmployees, setRatingsTeamEmployees] = useState({});
    const [commnetsValues, setCommnetsValues] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [color, setColor] = useState('trasparent');

    //const team
    const [totalTeam, setTotalTeam] = useState();
    const [totalPercent, setTotalPercent] = useState();
    const [totalSpend, setTotalSpend] = useState();
    const [totalRemaining, setTotalRemaining] = useState();

    //const employees-ratings
    const [currentBase, setCurrentBase] = useState(150000);
    const [totalPriceByEmployee, setTotalPriceByEmployee] = useState({});
    const [totalPercentByEmployee, setTotalPercentByEmployee] = useState({});

    const router = useRouter();

    useEffect(() => {
        if (session?.user.token) {
            load();
        }

    }, [id, session?.user.token]);

    useEffect(() => {
        if (reviewTeam?.price !== undefined && totalSpend !== undefined) {
            const totalRemaining = calculateTotalRemaining();
            console.log('pasa', totalRemaining);
            setTotalRemaining(totalRemaining);
        }
    }, [reviewTeam, totalSpend]);

    useEffect(() => {
        if (teamEmployees && totalPriceByEmployee) {
            const valuesByEmployeeWithPercentage = {};
            for (const key in totalPriceByEmployee) {
                valuesByEmployeeWithPercentage[key] = calculatePorcent(teamEmployees, totalPriceByEmployee[key], key);
            }
            setTotalPercentByEmployee(valuesByEmployeeWithPercentage);
        }
    }, [teamEmployees, totalPriceByEmployee]);

    const updateEmployeesTeams = async (team) => {
        //setTeamEmployees
        //const updateCommentsValues = {};

        const promises = team.employees.map(item =>
            fetchData(session?.user.token, 'GET', `employees/${item.id}`)
        );

        const teamResponses = await Promise.all(promises);
        console.log(teamResponses)
        //updateCommentsValues[`${item.id}-${item.actual_external_data.annual_salary }`] ;

        setTeamEmployees(teamResponses)
    }

    const load = async () => {
        try {
            // team
            const teamResponse = await fetchData(session?.user.token, 'GET', `teams/${id}`);
            setTeam(teamResponse[0]);

            // update all employees with salary
            updateEmployeesTeams(teamResponse[0]);

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
            updateRatingsEmployees(filterRatingEmployees)

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const calculatePorcent = (teamEmployees, value, key) => {
        if (!Array.isArray(teamEmployees)) {
            return;
        }
        let employeesSalary = teamEmployees.find(item => item.id == parseInt(key));
        if (!employeesSalary) {
            return;
        }
        if (!employeesSalary.actual_external_data || !employeesSalary.actual_external_data.annual_salary) {
            return;
        }
        let salary = employeesSalary.actual_external_data.annual_salary;
        const montoSinFormato = salary.replace(/\$|,/g, '');
        const montoNumero = parseFloat(montoSinFormato);
        if (isNaN(montoNumero)) {
            return;
        }
        const result = (montoNumero * value) / 100;
        console.log(`Calculando porcentaje para ${key}:`, result); // Agrega este log
        return result;
    }

    const calculateTotalRemaining = () => {
        const price = reviewTeam?.price;
        const spend = totalSpend;
        console.log('Price:', price, 'Spend:', spend); // Verificar valores
        if (price !== undefined && spend !== undefined) {
            return price - spend;
        }
        return 0; // Devuelve 0 si no hay datos
    };

    const calculateTotalPrice = (updatedRangeValues) => {
        let totalPrice = 0;
        for (const key in updatedRangeValues) {
            const percentValue = updatedRangeValues[key];
            totalPrice += percentValue;
        }
        return { totalPrice };
    }

    const calculateTotalsByEmployee = (updatedRangeValues) => {
        const totalByEmployees = {};

        for (const key in updatedRangeValues) {
            const [currentRatingsId, currentEmployeeId] = key.split('-');
            const currentValue = parseInt(updatedRangeValues[key], 10);
            if (!totalByEmployees[currentEmployeeId]) {
                totalByEmployees[currentEmployeeId] = 0;
            }
            totalByEmployees[currentEmployeeId] += currentValue;
        }
        return { totalByEmployees };
    };

    const calculateTotalsPercentEmployee = (updatedPercentValues) => {
        let totalPercentSum = 0;

        for (const key in updatedPercentValues) {
            const percentValue = updatedPercentValues[key];
            totalPercentSum += percentValue; // Suma el valor al total
        }
        return { totalPercentSum };

    };

    const handleRangeChange = (e, ratingsId, employeeId) => {
        const value = parseInt(e.target.value, 10);
        setRangeValues(prevState => {
            const updatedRangeValues = {
                ...prevState,
                [`${ratingsId}-${employeeId}`]: value
            };
            console.log(updatedRangeValues)
            // Calcular los totales por employeeId
            const { totalByEmployees } = calculateTotalsByEmployee(updatedRangeValues);

            // Actualizar el total propuesto y el estado con los valores actualizados
            setTotalPriceByEmployee(totalByEmployees);

            // Calcular y guardar los valores por ID utilizando el porcentaje
            const valuesByEmployeeWithPercentage = {};
            for (const key in totalByEmployees) {
                valuesByEmployeeWithPercentage[key] = calculatePorcent(teamEmployees, totalByEmployees[key], key);
            }
            setTotalPercentByEmployee(valuesByEmployeeWithPercentage);

            // update nuevos valores al team
            const totalSpend = Object.values(valuesByEmployeeWithPercentage).reduce((acc, value) => acc + value, 0);
            setTotalPercent(totalSpend);

            const { totalPercentSum } = calculateTotalsPercentEmployee(updatedRangeValues)
            const totalRemaining = calculateTotalRemaining();

            //total team
            setTotalPercent(totalPercentSum);
            setTotalSpend(totalSpend)
            setTotalRemaining(totalRemaining);

            if (totalRemaining < 0) {
                setColor('red')
            } else {
                setColor('')
            }

            return updatedRangeValues;
        });

    };

    const updateRatingsEmployees = (data) => {

        const updatedPercentValues = {};
        const updateCommentsValues = {};
        const updatePriceValues = {};

        data.forEach(item => {
            updatedPercentValues[`${item.ratings_id}-${item.employees_id}`] = item.percent;
            updateCommentsValues[`${item.ratings_id}-${item.employees_id}`] = item.comments;
            updatePriceValues[`${item.ratings_id}-${item.employees_id}`] = item.price;
        });

        const { totalByEmployees } = calculateTotalsByEmployee(updatedPercentValues);
        const { totalPrice } = calculateTotalPrice(updatePriceValues);
        const { totalPercentSum } = calculateTotalsPercentEmployee(updatedPercentValues)

        //total team
        setTotalPercent(totalPercentSum);
        setTotalSpend(totalPrice)

        // total employees rating
        setTotalPriceByEmployee(totalByEmployees);

        setRangeValues(prevState => ({
            ...prevState,
            ...updatedPercentValues
        }));

        // update comements
        setCommnetsValues(prevState => ({
            ...prevState,
            ...updateCommentsValues
        }));
    }

    const handleCheckboxChange = async (ratingsId, employeesId, isChecked) => {
        setShowToast(false);

        const values = {
            reviews_id: reviews_id,
            teams_id: id,
            employees_id: employeesId,
            ratings_id: ratingsId,
            price: null,
            percent: null,
            comments: null,
            status: 1
        };

        if (isChecked) {

            // El checkbox está marcado
            const response = await apiRequest(`reviews_teams_employees/`, 'POST', values);
            console.log(response)
            setShowToast(true);
            setToastMessage('Update successful');

        } else {

            let reviewTeamEmployeesId = ratingsTeamEmployees.find(item =>
                item.reviews_id == parseInt(reviews_id) &&
                item.employees_id == parseInt(employeesId) &&
                item.ratings_id == parseInt(ratingsId) &&
                item.teams_id == parseInt(id)
            );

            if (reviewTeamEmployeesId) {

                // El checkbox está desmarcado
                const response = await fetchData(session?.user.token, 'DELETE', `reviews_teams_employees/delete/${reviewTeamEmployeesId.id}`);
                console.log(response);
                setShowToast(true);
                setToastMessage('Update successful');

                // Eliminar el elemento del estado ratingsTeamEmployees
                const filteredRatingsTeamEmployees = ratingsTeamEmployees.filter(item =>
                    item.id !== reviewTeamEmployeesId.id
                );
                console.log(filteredRatingsTeamEmployees)
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

        let currentSalary = calculatePorcent(teamEmployees, percent, employeesId);

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
                price: currentSalary,
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


    const changeStatusByRatings = async (e, employeesId, optionId, status) => {
        console.log(optionId, employeesId, status)
        try {
            const reviewTeamEmployeesId = ratingsTeamEmployees.find(item =>
                item.reviews_id == parseInt(reviews_id) &&
                item.employees_id == employeesId &&
                item.ratings_id == optionId &&
                item.teams_id == parseInt(id)
            );
            console.log(reviewTeamEmployeesId)
            const values = {
                status: status,
            };

            const response = await apiRequest(`reviews_teams_employees/edit/${reviewTeamEmployeesId.id}`, 'PUT', values);
            console.log(response)
        } catch (error) {
            console.error('Error updating:', error);
        }
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
                            <td>% {totalPercent ? totalPercent : 0}</td>
                            <td> $ {totalSpend ? totalSpend : 0}</td>
                            <td style={{ color: color }}> $ {totalRemaining ? totalRemaining : 0}</td>
                        </tr>
                    </tbody>
                </table>

            </div>
            {
                teamEmployees && teamEmployees.map((item, rowIndex) => (
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
                                            <td>{item.actual_external_data.annual_salary ? item.actual_external_data.annual_salary : 0}</td>
                                            <td>$ {totalPriceByEmployee[item.id] ? totalPriceByEmployee[item.id] : 0}</td>
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
                                                            value={option.id !== null ? option.id : undefined}
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
                                                <td>
                                                    <a className='btn btn-primary btn-xs' onClick={(e) => changeStatusByRatings(e, item.id, option.id, 1)}>pending</a>
                                                </td>
                                                <td>
                                                    <a className='btn btn-primary btn-xs' onClick={(e) => changeStatusByRatings(e, item.id, option.id, 2)}>aproved</a>
                                                </td>
                                                <td>
                                                    <a className='btn btn-primary btn-xs' onClick={(e) => changeStatusByRatings(e, item.id, option.id, 3)}>rejected</a>
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