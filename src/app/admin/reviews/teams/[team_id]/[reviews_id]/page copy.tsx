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

const FormEmployees: React.FC = () => {
    // params
    const { team_id, reviews_id } = useParams();

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

    //const employees-ratings
    const [totalPriceByEmployee, setTotalPriceByEmployee] = useState({});
    const [totalPercentByEmployee, setTotalPercentByEmployee] = useState({});

    // ratings
    const [selectedRatings, setSelectedRatings] = useState({});
    const [inputValues, setInputValues] = useState({});
    const [ratingRanges, setRatingRanges] = useState({}); // Estado para almacenar min y max


    const isValidator = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'approver');
    const isManager = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'manager');
    const isAdmin = session?.user.roles.some(role => role.name === 'administrator');
    const isSuper = session?.user.roles.some(role => role.name === 'superuser');

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
            const reviewTeamEmployeesResponse = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=1000`);

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

        data.forEach(item => {
            updatedPercentValues[`${item.ratings_id}-${item.employees_id}`] = item.percent;
            updateCommentsValues[`${item.ratings_id}-${item.employees_id}`] = item.comments;
            updatePriceValues[`${item.ratings_id}-${item.employees_id}`] = item.price;
            updateStatus[`${item.ratings_id}-${item.employees_id}`] = item.status;
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

        // update status
        setStatusValues(prevState => ({
            ...prevState,
            ...updateStatus
        }));
    }

    const isCheckboxChecked = (optionId, itemId) => {
        return ratingsTeamEmployees && ratingsTeamEmployees.length > 0 && ratingsTeamEmployees.some(item => item.ratings_id == optionId && item.employees_id == itemId);
    };

    const handleSubmit = async (values, item) => {
        
        const items = Object.keys(values).reduce((acc, key) => {
            const [ratingsId, employeesId, field] = key.split('-');
            const ratingsIdInt = parseInt(ratingsId, 10);
            const employeesIdInt = parseInt(employeesId, 10);
            let item = acc.find(i => i.ratingsId === ratingsIdInt && i.employeesId === employeesIdInt);
            if (!item) {
                item = { ratingsId: ratingsIdInt, employeesId: employeesIdInt, percent: "", comments: "", checked: false };
                acc.push(item);
            }
            if (field === 'checked') {
                item.checked = values[key];
            } else {
                item[field] = values[key];
            }
            return acc;
        }, []);
        
        const checkedItems = items.filter(item => item.checked && item.percent !== null && item.percent !== "");
        const uncheckedItems = items.filter(item => !item.checked);

        // Borrar los registros desmarcados
        for (const item of uncheckedItems) {
            const existingRecord = ratingsTeamEmployees.find(r =>
                r.ratings_id === item.ratingsId && r.employees_id === item.employeesId
            );
            if (existingRecord) {
                try {
                    // Realiza la solicitud DELETE
                    await apiRequest(`reviews_teams_employees/delete/${existingRecord.id}`, 'DELETE');
         
                } catch (error) {
                    console.error('Error al eliminar datos:', error);
                }
            }
        }

        // Guardar los registros marcados
        for (const item of checkedItems) {
            let currentSalary = calculatePorcent(teamEmployees, item.percent, item.employeesId);
            const payload = {
                reviews_id: reviews_id,
                teams_id: team_id,
                ratings_id: item.ratingsId,
                employees_id: item.employeesId,
                price: currentSalary,
                percent: item.percent,
                comments: item.comments,
                status: item.status ? item.status : 0,
            };

            // Verificar si el registro ya existe
            const existingRecord = ratingsTeamEmployees.find(r =>
                r.ratings_id === item.ratingsId && r.employees_id === item.employeesId
            );
            try {
                if (existingRecord) {
                    // Si existe, realiza un PUT
                    const response = await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);
                    
                } else {
                    // Si no existe, realiza un POST
                    const response = await apiRequest(`reviews_teams_employees/`, 'POST', payload);
                   
                }
            } catch (error) {
                console.error('Error al enviar datos:', error);
            }
        }
        showSuccessAlert("Your work has been saved");
        load();
    };

    const ModalComp = ({ isOpen, onClose, children, title }) => {
        if (!isOpen) return null;

        return (
            <Modal size="lg" fade show={true} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title><strong>Review: {title} </strong></Modal.Title>
                </Modal.Header>
                <Modal.Body>{children}</Modal.Body>
            </Modal>
        );
    };

    const changeStatusByRatings = async (e, ratingId, employeesId, status) => {

        const payload = {
            status: status,
        };

        // Verificar si el registro ya existe
        const existingRecord = ratingsTeamEmployees.find(r =>
            r.ratings_id === ratingId && r.employees_id === employeesId && r.reviews_id === reviews_id && r.teams_id === team_id
        );

        try {
            if (existingRecord) {
                // Si existe, realiza un PUT
                //await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);
                showSuccessAlert("Your work has been saved");
                

            }
        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    };

    /*
    const NewFormModal = ({ item }) => {
        const [modalId, setModalId] = useState(null);
        const openModal = (id) => setModalId(id);
        const closeModal = () => {
            //load();
            setModalId(null);
        }

        const initialValues = (ratings || []).reduce((acc, option) => {
            acc[`${option.id}-${item.id}-percent`] = rangeValues[`${option.id}-${item.id}`] || '';
            acc[`${option.id}-${item.id}-comments`] = commnetsValues[`${option.id}-${item.id}`] || '';
            acc[`${option.id}-${item.id}-status`] = statusValues[`${option.id}-${item.id}`];
            acc[`${option.id}-${item.id}-checked`] = isCheckboxChecked(option.id, item.id)

            return acc;
        }, {});

        return (
            <>
                <button className="btn btn-primary" onClick={() => openModal(item.id)}>Review</button>
                <ModalComp isOpen={modalId === item.id} onClose={closeModal} title={item.name}>
                    <Formik
                        initialValues={initialValues}
                        onSubmit={(values) => {
                            //console.log('Valores enviados:', values);
                            handleSubmit(values, item.id); // Llama a la función que maneja el submit
                        }}
                    >
                        {({ values, setFieldValue }) => (
                            <Form>
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Ratings</th>
                                            <th>%</th>
                                            <th>Comments</th>
                                            <th className='text-end'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ratings && ratings.map((option, key) => (
                                            <RatingRow
                                                key={key}
                                                option={option}
                                                item={item}
                                                isManager={isManager}
                                                isValidator={isValidator}
                                                values={values}
                                                setFieldValue={setFieldValue} // Pasa setFieldValue a RatingRow
                                                changeStatusByRatings={changeStatusByRatings}
                                            />
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        {isValidator || isSuper || isManager ? (
                                            <tr>
                                                <th scope="row" colSpan={3}>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary"
                                                        disabled={loading}
                                                    >
                                                        <i className="bi bi-update"></i> {loading ? 'Save...' : 'Update'}
                                                    </button>
                                                </th>
                                                <th></th>
                                            </tr>
                                        ) : null}
                                    </tfoot>
                                </table>
                            </Form>
                        )}
                    </Formik>
                </ModalComp>
            </>
        );
    };
    */
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

    return (
        <div className="row">
            {loading ? (
                <div>Cargando...</div>
            ) : (
                <>
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
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>$ {reviewTeam ? formatPrice(reviewTeam.price) : 0}</strong></td>
                                    <td>% {totalPercent ? totalPercent : 0}</td>
                                    <td>$ {totalSpend ? formatPrice(totalSpend) : 0}</td>
                                    <td style={{ color: color }}>$ {totalRemaining ? formatPrice(totalRemaining) : 0}</td>
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
                                                % {totalPriceByEmployee[item.id] || 0}
                                            </td>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {totalPercentByEmployee[item.id] !== undefined
                                                    ? `$ ${formatPrice(totalPercentByEmployee[item.id])}`
                                                    : `$ 0.00`}
                                            </td>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>$ 0</td>
                                            <td>
                                                <select
                                                    className="form-control"
                                                    style={{ width: '100%' }}
                                                    value={selectedRatings[item.id] || ''} // Usar el estado específico para este empleado
                                                    onChange={(e) => handleSelectChange(item.id, e)} // Pasar el ID del empleado
                                                >
                                                    <option value="" label="Select option" />
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
                                                    placeholder={`min ${ratingRanges[item.id]?.min || 0} - max ${ratingRanges[item.id]?.max || 0}`} // Usar los rangos
                                                />
                                            </td>
                                            <td>
                                                <>
                                                    <a className={`btn btn-light btn-xs m-1`} onClick={(e) => { /*toggleLike(1);*/ }}>
                                                        <i className={`bi bi-hand-thumbs-up`}></i>
                                                    </a>
                                                    <a className={`btn btn-light btn-xs m-1`} onClick={(e) => { /*toggleLike(2);*/ }}>
                                                        <i className={`bi bi-hand-thumbs-down `}></i>
                                                    </a>
                                                </>
                                            </td>
                                            <td>
                                                <a className={`btn btn-light btn-xs m-1`} onClick={(e) => { /*toggleLike(2);*/ }}>
                                                    <i className="bi bi-arrow-clockwise"></i>
                                                </a>
                                            </td>
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