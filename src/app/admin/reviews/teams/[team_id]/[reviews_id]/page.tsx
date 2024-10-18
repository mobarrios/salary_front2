'use client'

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { fetchData } from '@/server/services/core/fetchData'
import { apiRequest } from "@/server/services/core/apiRequest";
import RatingRow from "@/components/Rating/RatingRow";
import { calculateTotalRemaining, calculatePorcent, calculateTotalPrice, calculateTotalsByEmployee, calculateTotalsPercentEmployee, formatSalary } from '@/functions/formEmployeeHandlers';
import { Formik, Form } from 'formik';
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';
import Modal from 'react-bootstrap/Modal';
import { Button } from "react-bootstrap";
import { Title } from "@/components/Title";
import { formatPrice } from '@/functions/formatDate';
import Breadcrumb from "@/components/BreadCrumb";
import { item } from "@/types/item";

const FormEmployees: React.FC = () => {
    // params
    const { team_id, reviews_id } = useParams();
    const bc = [{ label: 'Review cycle', url: '/admin/reviews' }, { label: 'Review' }];

    const { data: session } = useSession()
    const [team, setTeam] = useState();
    const [teamEmployees, setTeamEmployees] = useState();
    const [reviewTeam, setReviewTeam] = useState({});
    const [ratings, setRatings] = useState();
    const [rangeValues, setRangeValues] = useState({});
    const [ratingsTeamEmployees, setRatingsTeamEmployees] = useState({});
    const [commnetsValues, setCommnetsValues] = useState({});
    const [statusValues, setStatusValues] = useState({});
    const [salaryValues, setSalaryValues] = useState({});


    const [color, setColor] = useState('trasparent');
    const [errorRemaining, setErrorRemaining] = useState(false)
    const [loading, setLoading] = useState(false)

    //const team
    const [totalPercent, setTotalPercent] = useState();
    const [totalSpend, setTotalSpend] = useState();
    const [totalRemaining, setTotalRemaining] = useState();
    const [totalApproved, setTotalApprovede] = useState(0);
    const [totalRejected, setTotalRejected] = useState(0);

    //const employees-ratings
    //const [totalPriceByEmployee, setTotalPriceByEmployee] = useState({});
    //const [totalPercentByEmployee, setTotalPercentByEmployee] = useState({});

    // ratings
    const [selectedRatings, setSelectedRatings] = useState({});
    const [ratingRanges, setRatingRanges] = useState({}); // Estado para almacenar min y max

    const [approvedIds, setApprovedIds] = useState([]);
    const [errorMax, setErrorMax] = useState();
    const [errorMin, setErrorMin] = useState();

    //const [calculatedPrices, setCalculatedPrices] = useState({});
    const isValidator = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'approver');
    const isManager = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'manager' || role.name === 'administrator');
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (session?.user.token) {
            load();
        }
    }, [team_id, session?.user.token]);

    useEffect(() => {
        if (reviewTeam?.price !== undefined && totalSpend !== undefined) {
            const totalRemaining = calculateTotalRemaining(reviewTeam?.price, totalSpend);
            setTotalRemaining(totalRemaining);

            if (totalRemaining < 0) {

                setColor('red')
                setErrorRemaining(true)
            } else {

                setColor('')
                setErrorRemaining(false)
            }
        }
    }, [reviewTeam, totalSpend]);

    const updateEmployeesTeams = async (team) => {

        const promises = team.employees.map(item =>
            fetchData(session?.user.token, 'GET', `employees/${item.id}`)
        );

        const teamResponses = await Promise.all(promises);
        setTeamEmployees(teamResponses)

        const newSalaryValues = {};

        // Iterar sobre las respuestas y guardar el id y el salary
        teamResponses.forEach(employee => {
            newSalaryValues[employee.id] = formatSalary(employee.actual_external_data.annual_salary); // Asegúrate de que 'salary' sea el campo correcto
        });
        setSalaryValues(newSalaryValues)
    }

    const load = async () => {
        setLoading(true);
        try {
            // team
            const teamResponse = await fetchData(session?.user.token, 'GET', `teams/${team_id}`);
            setTeam(teamResponse[0]);

            // update all employees with salary
            updateEmployeesTeams(teamResponse[0]);

            // all team review
            const teamReview = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=1000`);

            // filter team review
            const filteredData = teamReview.data.filter(item => item.teams_id == team_id && item.reviews_id == reviews_id);
            setReviewTeam(filteredData[0])

            // ratings
            const ratingsResponse = await fetchData(session?.user.token, 'GET', `ratings/all/?skip=0&limit=1000`);
            setRatings(ratingsResponse.data);

            //all review teams employees
            const reviewTeamEmployeesResponse = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=100`);
            // filter rating y employees
            const filterRatingEmployees = reviewTeamEmployeesResponse.data.filter(item => item.teams_id == team_id && item.reviews_id == reviews_id);

            setRatingsTeamEmployees(filterRatingEmployees);
            updateRatingsEmployees(filterRatingEmployees)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRatingsEmployees = (data) => {

        const updatedPercentValues = {};
        const updateCommentsValues = {};
        const updatePriceValues = {};
        const updateStatus = {};
        const updateRatingsValues = {};

        // Inicializar contadores para totales aprobados y rechazados
        let totalApproved = 0;
        let totalRejected = 0;

        data.forEach(item => {
            updatedPercentValues[`${item.employees_id}`] = item.percent;
            updateCommentsValues[`${item.employees_id}`] = item.comments;
            updateRatingsValues[`${item.employees_id}`] = item.ratings_id;
            updatePriceValues[`${item.employees_id}`] = item.price;
            updateStatus[`${item.employees_id}`] = item.status;

            if (item.status === 1) {
                totalApproved += 1; // Aumentar el contador de aprobados
            } else if (item.status === 2) {
                totalRejected += 1; // Aumentar el contador de rechazados
            }
        });


        //const { totalByEmployees } = calculateTotalsByEmployee(updatedPercentValues);
        const { totalPrice } = calculateTotalPrice(updatePriceValues);
        const { totalPercentSum } = calculateTotalsPercentEmployee(updatedPercentValues)
        //const totalSpend = calculateTotalSpend(updatePriceValues);
        //console.log(totalSpend)
        //setTotalSpend(totalSpend.totalSpend);

        //total team
        setTotalPercent(totalPercentSum);
        setTotalSpend(totalPrice)
        setTotalApprovede(totalApproved)
        setTotalRejected(totalRejected)

        setRangeValues(prevState => ({
            ...prevState,
            ...updatedPercentValues
        }));

        // update comements
        setCommnetsValues(prevState => ({
            ...prevState,
            ...updateCommentsValues
        }));

        // update status
        setStatusValues(prevState => ({
            ...prevState,
            ...updateStatus
        }));

        setSelectedRatings(prevState => ({
            ...prevState,
            ...updateRatingsValues
        }));

    }

    const handleSubmit = async (employeesId) => {
        let employeesSalary = teamEmployees.find(item => item.id == parseInt(employeesId));
        if (!employeesSalary) {
            return;
        }

        // Validar campos requeridos
        const currentRating = selectedRatings[employeesId];
        const currentRangeValue = rangeValues[employeesId];

        console.log('EmployeesId', employeesId)
        console.log('currentRating', currentRating)
        console.log('currentRangeValue', currentRangeValue)

        const newErrors = {};
        if (!currentRating) {
            newErrors.rating = 'Required.';
        }
        if (currentRangeValue === undefined || currentRangeValue === '' || !currentRangeValue) {
            newErrors.range = 'Required.';
        }

        if (Object.keys(newErrors).length > 0) {
            console.log('error')
            setErrors(newErrors);
            //showErrorAlert("required fields error");
            return; // Detener el envío si hay errores
        }

        // Si no hay errores, continuar con el envío
        let currentSalary = calculatePriceByEmployee(employeesId);
        let ratingId = selectedRatings[employeesId];
        let percent = rangeValues[employeesId];

        const payload = {
            reviews_id: reviews_id,
            teams_id: team_id,
            ratings_id: ratingId,
            employees_id: employeesId,
            price: currentSalary,
            percent: percent,
        };

        // Verificar si el registro ya existe
        /*
        const existingRecord = ratingsTeamEmployees.find(r =>
            r.ratings_id === ratingId && r.employees_id === employeesId
        );
        */

        // solo validar el employees
        const existingRecord = ratingsTeamEmployees.find(r =>
            r.employees_id === employeesId
        );
        console.log(existingRecord)
        try {
            let response;

            if (existingRecord) {
                response = await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);
                console.log(response)
                setRatingsTeamEmployees(prevState =>
                    prevState.map(item =>
                        item.id === existingRecord.id ? { ...item, ...payload } : item
                    )
                );
            } else {
                response = await apiRequest(`reviews_teams_employees/`, 'POST', payload);
                console.log(response)
                setRatingsTeamEmployees(prevState => [...prevState, { ...payload, id: response.id }]);
            }

        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
        showSuccessAlert("Your work has been saved");
        setErrors('')
    };

    const handleSelectChange = (employeeId, event) => {
        const selectedId = event.target.value;

        // Encuentra la opción seleccionada en ratings
        const selectedRating = ratings.find(option => option.id == selectedId);

        // Almacena el rating seleccionado
        setSelectedRatings(prevState => ({
            ...prevState,
            [employeeId]: selectedId
        }));

        // Actualiza los valores de rango (min y max) si se encuentra la opción
        if (selectedRating) {
            setRatingRanges(prevState => ({
                ...prevState,
                [employeeId]: {
                    min: selectedRating.percent_min,
                    max: selectedRating.percent_max
                }
            }));

            setRangeValues(prevState => ({
                ...prevState,
                [employeeId]: ''
            }));

        }
    };

    const calculateTotalSpend = (updatedRangeValues) => {

        let totalSpend = 0;
        for (const key in updatedRangeValues) {
            const totalByEmployee = calculatePrice(key, updatedRangeValues[key]);
            totalSpend += totalByEmployee;
        }

        return { totalSpend };
    };

    const calculatePrice = (employeeId, percent) => {
        const salary = salaryValues[employeeId];
        const numericPercent = percent === '' ? 0 : parseFloat(percent);

        if (isNaN(salary) || isNaN(numericPercent)) {
            console.error(`Invalid salary or percent for employeeId ${employeeId}: salary=${salary}, percent=${numericPercent}`);
            return 0; // O maneja el error de otra manera
        }

        const result = (salary * numericPercent) / 100;
        return result;
    };

    const calculatePriceByEmployee = (employeeId) => {
        const percent = rangeValues[employeeId];
        const salary = salaryValues[employeeId]
        const result = (salary * percent) / 100;
        return result
    };

    const handleInputChange = (e, id) => {
        const newValue = e.target.value; // Obtén el nuevo valor del input
        const numericValue = newValue === '' ? 0 : Number(newValue); // Convierte a número o deja en 0 si está vacío

        // Actualiza el estado de rangeValues
        setRangeValues(prevState => {
            const updatedRangeValues = {
                ...prevState,
                [id]: numericValue // Actualiza el valor específico del empleado
            };

            // Calcula el total de gastos usando el nuevo estado
            const totalSpend = calculateTotalSpend(updatedRangeValues);

            // Actualiza el porcentaje total
            const { totalPrice } = calculateTotalPrice(updatedRangeValues);
            setTotalPercent(totalPrice); // Actualiza el porcentaje total

            // Establece el nuevo total de gastos
            setTotalSpend(totalSpend.totalSpend);

            return updatedRangeValues; // Devuelve el nuevo estado
        });
    };

    const changeStatusByRatings = async (employeesId, status) => {

        let ratingId = selectedRatings[employeesId]

        const payload = {
            status: status,
        };

        // Verificar si el registro ya existe
        const existingRecord = ratingsTeamEmployees.find(r =>
            r.ratings_id == ratingId && r.employees_id == employeesId && r.reviews_id == reviews_id && r.teams_id == team_id
        );

        try {
            if (existingRecord) {
                const previousStatus = statusValues[employeesId];

                const response = await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);
                //console.log(response);

                // Actualizar contadores según el nuevo estado
                if (status === 1) { // Aprobado
                    if (previousStatus === 2) { // Cambiando de rechazado a aprobado
                        setTotalRejected(prevTotal => prevTotal - 1);
                    }
                    if (!approvedIds.includes(employeesId)) {
                        setTotalApprovede(prevTotal => prevTotal + 1);
                        setApprovedIds(prevIds => [...prevIds, employeesId]);
                    }
                } else if (status === 2) { // Rechazado
                    if (previousStatus === 1) {
                        setTotalApprovede(prevTotal => prevTotal - 1);
                        setApprovedIds(prevIds => prevIds.filter(id => id !== employeesId));
                    }
                    setTotalRejected(prevTotal => prevTotal + 1);
                }

                setStatusValues(prevState => ({
                    ...prevState,
                    [employeesId]: status
                }));
            }
        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    };

    const findStatusByRatings = (employeeId) => {

        const status = statusValues[employeeId];
        let statusText = '';
        if (status === 1) {
            statusText = <span className="badge rounded-pill bg-success">aproved</span>;
        } else if (status === 2) {
            statusText = <span className="badge rounded-pill bg-danger">rejected</span>;
        } else if (status === 0) {
            statusText = <span className="badge rounded-pill bg-secondary">pending</span>;
        }

        return statusText
    }

    const changeStatusByReview = async (status) => {
        console.log(reviewTeam)
        const valuesData = {
            status: status,
        }

        try {

            const resp = await apiRequest(`reviews_teams/edit/${reviewTeam.id}`, 'PUT', valuesData)
            console.log(resp)
            showSuccessAlert("Your work has been saved");

            setReviewTeam(prevState => ({
                ...prevState,
                status: status, // Actualiza el status
            }));
        } catch (error) {
            showErrorAlert("An error occurred while saving");
            console.error('Error:', error);
        }

        showSuccessAlert("Your work has been saved");
        console.log(team_id, reviews_id)
    }

    const getInputClassName = (itemId) => {
        const value = rangeValues[itemId];
        const ratingId = selectedRatings[itemId];
        const selectedRating = ratings.find(option => option.id == ratingId);


        const isOutOfRange = Number(value) > (selectedRating?.percent_max || 0) ||
            Number(value) < (selectedRating?.percent_min || 0);

        return `form-control ${isOutOfRange ? 'text-danger' : ''}`;

    };

    console.log(reviewTeam?.status, ratingsTeamEmployees)
    console.log('isManager', isManager)
    return (
        <div className="row">
            {loading ? (
                <div>Cargando...</div>
            ) : (
                <>
                    <Breadcrumb items={bc} />

                    <Title>Reviews - {team?.name}</Title>

                    <div className='col-12 mt-5'>
                        {/* <h3 className='text-primary mb-5'></h3> */}
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Total amount to assign</th>
                                    <th>Total percent</th>
                                    <th>Total Spend</th>
                                    <th>Total Remaining</th>
                                    <th>Approved </th>
                                    <th>Rejected </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>$ {reviewTeam ? formatPrice(reviewTeam.price) : 0}</strong></td>
                                    <td> {totalPercent ? totalPercent : 0} %</td>
                                    <td>$ {totalSpend ? formatPrice(totalSpend) : 0}</td>
                                    <td style={{ color: color }}>
                                        $ {totalRemaining ? formatPrice(totalRemaining) : 0}
                                    </td>
                                    <td>{totalApproved}</td>
                                    <td>{totalRejected}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className='col-12'>

                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>Employees</th>
                                    <th style={{ width: '10%' }}>Current Base Annual Salary</th>
                                    <th style={{ width: '10%' }}>Proposed Total Increase %</th>
                                    <th style={{ width: '10%' }}>Proposed Total Increase $</th>
                                    {/* <th style={{ width: '10%' }}>Proposed New Base Hourly Rate</th> */}
                                    <th style={{ width: '15%' }}>Ratings</th>
                                    <th>Percent</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    teamEmployees && teamEmployees.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '10%' }}>
                                                {item.name} {item.last_name}
                                            </td>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '10%' }}>
                                                {item.actual_external_data.annual_salary || 0}
                                            </td>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {rangeValues[item.id] || 0} %
                                            </td>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                $ {formatPrice(calculatePriceByEmployee(item.id))}
                                            </td>
                                            {/* <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>$ 0</td> */}
                                            <td>
                                                <select
                                                    disabled={!isManager}
                                                    required
                                                    className="form-control"
                                                    style={{ width: '100%' }}
                                                    value={selectedRatings[item.id] || ''}
                                                    onChange={(e) => handleSelectChange(item.id, e)}

                                                >
                                                    <option value="" label="Seleccione una opción" />
                                                    {ratings && ratings.map((option) => (
                                                        <option key={option.id} value={option.id} label={option.name} />
                                                    ))}
                                                </select>
                                                {errors.rating && <div className="text-danger">{errors.rating}</div>}

                                            </td>
                                            <td>
                                                <input
                                                    required
                                                    min={0}
                                                    disabled={!isManager}
                                                    type='number'
                                                    step={1}
                                                    className={getInputClassName(item.id)}
                                                    style={{ width: '150px', margin: '0 5px' }}
                                                    value={rangeValues[item.id]}
                                                    placeholder={`min ${ratingRanges[item.id]?.min || 0} - max ${ratingRanges[item.id]?.max || 0}`}
                                                    onChange={(e) => handleInputChange(e, item.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSubmit(item.id);
                                                        }
                                                    }}
                                                />
                                                {errors.range && <div className="text-danger">{errors.range}</div>}
                                            </td>
                                            <td>
                                                {findStatusByRatings(item.id)}
                                            </td>
                                            {isValidator && (
                                                <td>
                                                    <>
                                                        <a
                                                            className={`btn btn-light btn-xs m-1`}
                                                            onClick={(e) => { changeStatusByRatings(item.id, 1); }}>
                                                            <i className={`bi bi-hand-thumbs-up ${statusValues[item.id] == 1 ? 'text-success' : ''}`}></i>
                                                        </a>
                                                        <a
                                                            className={`btn btn-light btn-xs m-1`}
                                                            onClick={(e) => { changeStatusByRatings(item.id, 2); }}>
                                                            <i className={`bi bi-hand-thumbs-down ${statusValues[item.id] == 2 ? 'text-danger' : ''}`}></i>
                                                        </a>
                                                    </>
                                                </td>
                                            )}

                                            {/* {isManager && (<td>
                                                <a className={`btn btn-light btn-xs m-1`}
                                                    onClick={(e) => {
                                                        handleSubmit(item.id);
                                                    }}
                                                >
                                                    <i className="bi bi-arrow-clockwise"></i>
                                                </a>
                                            </td>
                                            )} */}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <div className="col-12">
                <div className="bg-white">
                    {
                        isManager && reviewTeam?.status === 1 &&
                        (<a
                            onClick={() => changeStatusByReview(2)}
                            className={`btn btn-primary mt-3 float-end`}
                        //className={`btn btn-primary mt-3 float-end ${teamEmployees?.length === totalApproved ? '' : 'disabled'}  `}
                        >
                            <i className="bi bi-save"></i> Send to approver
                        </a>)
                    }

                    {
                        isValidator && reviewTeam?.status === 2 && (<a
                            onClick={() => changeStatusByReview(3)}
                            className={`btn btn-primary mt-3 float-end ${teamEmployees?.length === totalApproved ? '' : 'disabled'}  `}
                        >
                            <i className="bi bi-save"></i> Approver
                        </a>)

                    }

                    {
                        reviewTeam?.status === 3 && (
                            <span className="badge rounded-pill bg-success float-end p-3" style={{ fontSize: '1.0rem' }}>
                                <i className="bi bi-check-circle"></i> Done
                            </span>
                        )
                    }

                </div>
            </div>
        </div>
    );
};

export default FormEmployees;

