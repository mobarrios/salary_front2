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

    const [color, setColor] = useState('trasparent');
    const [loading, setLoading] = useState(false)

    //const team
    const [totalPercent, setTotalPercent] = useState();
    const [totalSpend, setTotalSpend] = useState();
    const [totalRemaining, setTotalRemaining] = useState();

    //const employees-ratings
    const [totalPriceByEmployee, setTotalPriceByEmployee] = useState({});
    const [totalPercentByEmployee, setTotalPercentByEmployee] = useState({});

    const router = useRouter();
    const isValidator = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'validator');
    const isManager = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'manager');

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
                    console.log('Eliminando...', existingRecord.id);
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
                status: 1,
            };

            // Verificar si el registro ya existe
            const existingRecord = ratingsTeamEmployees.find(r =>
                r.ratings_id === item.ratingsId && r.employees_id === item.employeesId
            );
            try {
                if (existingRecord) {
                    // Si existe, realiza un PUT
                    await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);
                    console.log('Actualizando...', payload);
                } else {
                    // Si no existe, realiza un POST
                    await apiRequest(`reviews_teams_employees/`, 'POST', payload);
                    console.log('Guardando...', payload);
                }
            } catch (error) {
                console.error('Error al enviar datos:', error);
            }
        }
        showSuccessAlert("Your work has been saved");
        load();
        router.refresh();
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

    const changeStatusByRatings = async (e, employeesId, status) => {
        console.log(employeesId, status)

        /*
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
            */
    };


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
            //acc[`${option.id}-${item.id}-checked`] = rangeValues[`${option.id}-${item.id}`] ? true : false;  // Inicializa como false por defecto
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
                                                reviews_id={reviews_id}
                                                team_id={team_id}
                                                ratingsTeamEmployees={ratingsTeamEmployees}
                                                session={session?.user.token}
                                            />
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th scope="row" colSpan={3}>

                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                >
                                                    <i className="bi bi-update"></i> update
                                                </button>

                                                {isValidator && (
                                                    <div className="float-end">

                                                        <a className='btn btn-primary btn-xs m-1' onClick={(e) => changeStatusByRatings(e, item.id, 1)}>pending</a>

                                                        <a className='btn btn-primary btn-xs m-1' onClick={(e) => changeStatusByRatings(e, item.id, 2)}>aproved</a>

                                                        <a className='btn btn-primary btn-xs m-1' onClick={(e) => changeStatusByRatings(e, item.id, 3)}>rejected</a>

                                                    </div>
                                                )}
                                            </th>
                                            <th></th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </Form>
                        )}
                    </Formik>
                </ModalComp>
            </>
        );
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
                                    <td><strong>$ {reviewTeam ? reviewTeam.price.toFixed(2) : 0}</strong></td>
                                    <td>% {totalPercent ? totalPercent : 0}</td>
                                    <td>$ {totalSpend ? totalSpend.toFixed(2) : 0}</td>
                                    <td style={{ color: color }}>$ {totalRemaining ? totalRemaining.toFixed(2) : 0}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='col-12'>
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Employees</th>
                                    <th>Current Base Annual Salary</th>
                                    <th>Proposed Total Increase %</th>
                                    <th>Proposed Total Increase $</th>
                                    <th>Proposed New Base Hourly Rate</th>
                                    <th>Proposed New Base Annual Salary</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    teamEmployees && teamEmployees.map((item, rowIndex) => (
                                        <tr key={item.id}>
                                            <td>{item.name} {item.last_name}</td>
                                            <td>{item.actual_external_data.annual_salary || 0}</td>
                                            <td>% {totalPriceByEmployee[item.id] || 0}</td>
                                            <td>$ {totalPercentByEmployee[item.id]?.toFixed(2) || 0}</td>
                                            <td>$ 0</td>
                                            <td>
                                                <NewFormModal item={item} />
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