'use client'

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { fetchData } from '@/server/services/core/fetchData'
import { apiRequest } from "@/server/services/core/apiRequest";
import RatingRow from "@/components/Rating/RatingRow";
import { calculateTotalRemaining, calculatePorcent, calculateTotalPrice, calculateTotalsByEmployee, calculateTotalsPercentEmployee } from '@/functions/formEmployeeHandlers';
import { Formik, Form } from 'formik';
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';
import Modal from 'react-bootstrap/Modal';
import { Button } from "react-bootstrap";
import { Title } from "@/components/Title";
import { formatPrice } from '@/functions/formatDate';
import Breadcrumb from "@/components/BreadCrumb";

const FormEmployees: React.FC = () => {
    // params
    const { team_id, reviews_id } = useParams();
  const bc = [{ label: 'Review cycle',url:'/admin/reviews'},{ label: 'Review'}];

    const { data: session } = useSession()
    const [team, setTeam] = useState();
    const [teamEmployees, setTeamEmployees] = useState();
    const [reviewTeam, setReviewTeam] = useState();
    const [ratings, setRatings] = useState();
    const [rangeValues, setRangeValues] = useState({});
    const [ratingsTeamEmployees, setRatingsTeamEmployees] = useState({});
    const [commnetsValues, setCommnetsValues] = useState({});
    const [statusValues, setStatusValues] = useState({});


    const [color, setColor] = useState('trasparent');
    const [loading, setLoading] = useState(false)

    //const team
    const [totalPercent, setTotalPercent] = useState();
    const [totalSpend, setTotalSpend] = useState();
    const [totalRemaining, setTotalRemaining] = useState();
    const [totalApproved, setTotalApprovede] = useState(0);
    const [totalRejected, setTotalRejected] = useState(0);

    //const employees-ratings
    const [totalPriceByEmployee, setTotalPriceByEmployee] = useState({});
    const [totalPercentByEmployee, setTotalPercentByEmployee] = useState({});

    // ratings
    const [selectedRatings, setSelectedRatings] = useState({});
    const [inputValues, setInputValues] = useState({});
    const [ratingRanges, setRatingRanges] = useState({}); // Estado para almacenar min y max
    const [approvedIds, setApprovedIds] = useState([]);

    const isValidator = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'approver');
    const isManager = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'manager');
    //const isAdmin = session?.user.roles.some(role => role.name === 'administrator');
    //const isSuper = session?.user.roles.some(role => role.name === 'superuser');

    useEffect(() => {
        if (session?.user.token) {
            load();
        }
    }, [team_id, session?.user.token]);

    useEffect(() => {
        if (reviewTeam?.price !== undefined && totalSpend !== undefined) {
            const totalRemaining = calculateTotalRemaining(reviewTeam?.price, totalSpend);
            setTotalRemaining(totalRemaining);
        }
    }, [reviewTeam, totalSpend]);

    useEffect(() => {
        if (teamEmployees && totalPriceByEmployee) {
            //console.log(teamEmployees, totalPriceByEmployee)
            const valuesByEmployeeWithPercentage = {};
            for (const key in totalPriceByEmployee) {
                valuesByEmployeeWithPercentage[key] = calculatePorcent(teamEmployees, totalPriceByEmployee[key], key);
            }
            setTotalPercentByEmployee(valuesByEmployeeWithPercentage);
            
        }
    }, [teamEmployees, totalPriceByEmployee]);

    const updateEmployeesTeams = async (team) => {

        const promises = team.employees.map(item =>
            fetchData(session?.user.token, 'GET', `employees/${item.id}`)
        );

        const teamResponses = await Promise.all(promises);
        setTeamEmployees(teamResponses)
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

        const { totalByEmployees } = calculateTotalsByEmployee(updatedPercentValues);
        const { totalPrice } = calculateTotalPrice(updatePriceValues);
        const { totalPercentSum } = calculateTotalsPercentEmployee(updatedPercentValues)

        //total team
        setTotalPercent(totalPercentSum);
        setTotalSpend(totalPrice)
        setTotalApprovede(totalApproved)
        setTotalRejected(totalRejected)

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
        console.log('employeesId', employeesId)

        console.log('selec:', selectedRatings[employeesId])
        console.log('percent:', rangeValues[employeesId])


        let employeesSalary = teamEmployees.find(item => item.id == parseInt(employeesId));

        if (!employeesSalary) {
            return;
        }

        //console.log(employeesSalary.actual_external_data.annual_salary)

        let currentSalary = calculatePrice(employeesSalary.actual_external_data.annual_salary, employeesId)
        let ratingId = selectedRatings[employeesId]
        let percent = rangeValues[employeesId]

        const payload = {
            reviews_id: reviews_id,
            teams_id: team_id,
            ratings_id: ratingId,
            employees_id: employeesId,
            price: currentSalary,
            percent: percent,
            //comments: item.comments,
            //status: item.status ? item.status : 0,
        };

        // Verificar si el registro ya existe
        const existingRecord = ratingsTeamEmployees.find(r =>
            r.ratings_id === ratingId && r.employees_id === employeesId
        );


        try {
            if (existingRecord) {
                // Si existe, realiza un PUT
                const response = await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);
                console.log('Actualizando...', payload, response);
            } else {
                // Si no existe, realiza un POST
                const response = await apiRequest(`reviews_teams_employees/`, 'POST', payload);
                console.log('Guardando...', payload, response);
            }
        } catch (error) {
            console.error('Error al enviar datos:', error);
        }

        showSuccessAlert("Your work has been saved");
        load();
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
                    min: selectedRating.percent_min, // Asumiendo que tienes estas propiedades
                    max: selectedRating.percent_max  // Asumiendo que tienes estas propiedades
                }
            }));
        }
    };

    const calculatePrice = (salary, employeesId) => {

        const percent = rangeValues[employeesId];

        const montoSinFormato = salary.replace(/\$|,/g, '');
        const montoNumero = parseFloat(montoSinFormato);
        if (isNaN(montoNumero)) {
            return;
        }
        const result = (montoNumero * percent) / 100;

        return result
    }

    const handleInputChange = (e, id) => {
        const newValue = e.target.value; // Obtén el nuevo valor del input
        const numericValue = newValue === '' ? 0 : Number(newValue); // Convierte a número o deja en 0 si está vacío

        setRangeValues(prevState => ({
            ...prevState,
            [id]: newValue // Actualiza el valor específico del empleado
        }));

        // Aquí puedes hacer algo con el nuevo valor cada vez que cambie
        console.log(`Nuevo valor para ${id}:`, newValue);

        /*
        const updatedTotalSpend = Object.keys(rangeValues).reduce((total, employeeId) => {
            const employeeValue = rangeValues[employeeId] || 0; // Obtén el valor actual o 0 si no existe
            return total + employeeValue; // Suma el valor del empleado al total
        }, 0) + numericValue; // Agrega el nuevo valor

        // Actualiza el total de gastos
        setTotalSpend(updatedTotalSpend);

        // Calcular el total restante
        const totalRemaining = calculateTotalRemaining(reviewTeam?.price, updatedTotalSpend);
        console.log(totalRemaining);
        setTotalRemaining(totalRemaining);
        */
    };

    const toggleLike = (type) => {
        //setFieldValue(`${option.id}-${item.id}-status`, type);
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
                console.log(response);

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

    return (
        <div className="row">
            {loading ? (
                <div>Cargando...</div>
            ) : (
                <>
                      <Breadcrumb items={bc}/>

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
                                    <th>rejected </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>$ {reviewTeam ? formatPrice(reviewTeam.price) : 0}</strong></td>
                                    <td> {totalPercent ? totalPercent : 0} %</td>
                                    <td>$ {totalSpend ? formatPrice(totalSpend) : 0}</td>
                                    <td style={{ color: color }}>$ {totalRemaining ? formatPrice(totalRemaining) : 0}</td>
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
                                    <th style={{ width: '10%' }}>Proposed New Base Hourly Rate</th>
                                    <th style={{ width: '15%' }}>Ratings</th>
                                    <th>Percent</th>
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
                                                $ {formatPrice(calculatePrice(item.actual_external_data.annual_salary, item.id))}

                                                {/* {totalPercentByEmployee[item.id] !== undefined
                                                    ? `$ ${formatPrice(totalPercentByEmployee[item.id])}`
                                                    : `$ 0.00`} */}
                                            </td>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>$ 0</td>
                                            <td>
                                                <select
                                                    className="form-control"
                                                    style={{ width: '100%' }}
                                                    value={selectedRatings[item.id] || ''} // Usar el estado específico para este empleado
                                                    onChange={(e) => handleSelectChange(item.id, e)} // Pasar el ID del empleado
                                                >
                                                    <option value="" label="Seleccione una opción" />
                                                    {ratings && ratings.map((option) => (
                                                        <option key={option.id} value={option.id} label={option.name} />
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type='number'
                                                    step={1}
                                                    className="form-control"
                                                    style={{ width: '150px', margin: '0 5px' }}
                                                    value={rangeValues[item.id]}
                                                    placeholder={`min ${ratingRanges[item.id]?.min || 0} - max ${ratingRanges[item.id]?.max || 0}`} // Usar los rangos
                                                    onChange={(e) => handleInputChange(e, item.id)}
                                                />
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

                                            {isManager && (<td>
                                                <a className={`btn btn-light btn-xs m-1`}
                                                    onClick={(e) => {
                                                        handleSubmit(item.id);
                                                    }}
                                                >
                                                    <i className="bi bi-arrow-clockwise"></i>
                                                </a>
                                            </td>
                                            )}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default FormEmployees;

