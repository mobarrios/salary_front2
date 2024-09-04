'use client'

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { fetchData } from '@/server/services/core/fetchData'
import { apiRequest } from "@/server/services/core/apiRequest";
import RatingRow from "@/components/Rating/RatingRow";
import { calculateTotalRemaining, calculatePorcent, calculateTotalPrice, calculateTotalsByEmployee, calculateTotalsPercentEmployee } from '@/functions/formEmployeeHandlers';
import ModalButton from "@/components/Modal/NewFormModal";
import FormRatings from "@/app/admin/ratings/form/page";
import styled from "styled-components";
import CloseButton from "@/components/Modal/CloseButton";
import { ModalContent, ModalOverlay } from "@/components/Modal/StyleModal";
import { Formik, Form, Field } from 'formik';

const FormEmployees: React.FC = () => {

    const { id, reviews_id } = useParams();
    const { data: session } = useSession()
    const [team, setTeam] = useState();
    const [teamEmployees, setTeamEmployees] = useState();
    const [reviewTeam, setReviewTeam] = useState();
    const [ratings, setRatings] = useState();
    const [rangeValues, setRangeValues] = useState({});
    const [ratingsTeamEmployees, setRatingsTeamEmployees] = useState({});
    const [commnetsValues, setCommnetsValues] = useState({});
    const [checkedValues, setCheckedValues] = useState({});

    const [color, setColor] = useState('trasparent');
    const [ratingsData, setRatingsData] = useState([]);

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

    }, [id, session?.user.token]);

    useEffect(() => {
        if (reviewTeam?.price !== undefined && totalSpend !== undefined) {
            const totalRemaining = calculateTotalRemaining(reviewTeam?.price, totalSpend);
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

        const promises = team.employees.map(item =>
            fetchData(session?.user.token, 'GET', `employees/${item.id}`)
        );

        const teamResponses = await Promise.all(promises);
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

    const updateRatingsEmployees = (data) => {

        const updatedPercentValues = {};
        const updateCommentsValues = {};
        const updatePriceValues = {};
        console.log(data)
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


    const handleSubmit = async (values, item) => {

        console.log(values, item)
        //setShowToast(false);
        //const percent = rangeValues[`${ratingsId}-${employeesId}`];
        //const comment = commnetsValues[`${ratingsId}-${employeesId}`];

        //let currentSalary = calculatePorcent(teamEmployees, percent, employeesId);

        /*
        const reviewTeamEmployeesId = ratingsTeamEmployees.find(item =>
            item.reviews_id == parseInt(reviews_id) &&
            item.employees_id == employeesId &&
            item.ratings_id == ratingsId &&
            item.teams_id == parseInt(id)
        );
        */
        try {
            /*
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
            */
            //const response = await apiRequest(`reviews_teams_employees/edit/${reviewTeamEmployeesId.id}`, 'PUT', values);
            //console.log(response);
            //setShowToast(true);
            //setToastMessage('Update successful');
        } catch (error) {
            console.error('Error updating:', error);
        }
    }

    const Modal = ({ isOpen, onClose, children }) => {
        if (!isOpen) return null;

        return (
            <ModalOverlay>
                <ModalContent onClick={e => e.stopPropagation()}> {/* Detener la propagación aquí */}
                    <CloseButton onClose={onClose} />
                    {children}
                </ModalContent>
            </ModalOverlay>
        );
    };


    const NewFormModal = ({ item }) => {
        const [modalId, setModalId] = useState(null);
        const openModal = (id) => setModalId(id);
        const closeModal = () => setModalId(null);

        const initialValues = (ratings || []).reduce((acc, option) => {
            acc[`${option.id}-${item.id}-percent`] = rangeValues[`${option.id}-${item.id}`] || '';
            acc[`${option.id}-${item.id}-comments`] = commnetsValues[`${option.id}-${item.id}`] || '';
            acc[`${option.id}-${item.id}-checked`] = rangeValues[`${option.id}-${item.id}`] ? true : false;  // Inicializa como false por defecto
            return acc;
        }, {});

        return (
            <>
                <button className="btn btn-primary" onClick={() => openModal(item.id)}>Review</button>
                <Modal isOpen={modalId === item.id} onClose={closeModal}>
                    <Formik
                        initialValues={initialValues}
                        onSubmit={(values) => {
                            //console.log('Valores enviados:', values);
                            handleSubmit(values, item.id); // Llama a la función que maneja el submit
                        }}
                    >
                        {({ values, setFieldValue }) => (
                            <Form>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Ratings</th>
                                            <th>%</th>
                                            <th>Comments</th>
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
                                            />
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th scope="row" colSpan={3}>
                                                <button
                                                    type="submit"
                                                    className='btn btn-success btn-xs float-end'
                                                >
                                                    <i className="bi bi-update"></i> update
                                                </button>
                                            </th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </>
        );
    };


    return (
        <div className="row">

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

            <div className='col-12'>

                <table className="table table-bordered">
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
                                <tr>
                                    <td>{item.name} {item.last_name}</td>
                                    <td>{item.actual_external_data.annual_salary ? item.actual_external_data.annual_salary : 0}</td>
                                    <td>$ {totalPriceByEmployee[item.id] ? totalPriceByEmployee[item.id] : 0}</td>
                                    <td>$ {totalPercentByEmployee[item.id] ? totalPercentByEmployee[item.id] : 0}</td>
                                    <td>$ 0</td>
                                    <td>
                                        <NewFormModal
                                            item={item}
                                        />
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default FormEmployees;