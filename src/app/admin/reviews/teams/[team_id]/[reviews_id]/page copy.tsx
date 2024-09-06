'use client'

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { fetchData } from '@/server/services/core/fetchData'
import { apiRequest } from "@/server/services/core/apiRequest";
import ToastComponent from '@/components/ToastComponent';
import RatingRow from "@/components/Rating/RatingRow";
import { calculateTotalRemaining, calculatePorcent, calculateTotalPrice, calculateTotalsByEmployee, calculateTotalsPercentEmployee } from '@/functions/formEmployeeHandlers';
import ModalButton from "@/components/Modal/NewFormModal";
import FormRatings from "@/app/admin/ratings/form/page";
import styled from "styled-components";
import CloseButton from "@/components/Modal/CloseButton";

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
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [color, setColor] = useState('trasparent');

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
            const totalRemaining = calculateTotalRemaining(reviewTeam?.price, totalSpend);

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

        //load();
        //router.refresh();

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

    const Modal = ({ isOpen, onClose, children }) => {
        if (!isOpen) return null;
        return (
            <ModalOverlay>
                <ModalContent>
                    <CloseButton onClose={onClose} />
                    {children}
                </ModalContent>
            </ModalOverlay>
        );
    };

    // Estilos para el modal
    const ModalOverlay = styled.div`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    const ModalContent = styled.div`
        background: white;
        padding: 30px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        width: 90vw; /* 90% del ancho de la ventana */
        max-width: 900px; /* Ancho máximo */
        height: auto; /* Permite que la altura sea automática */
        max-height: 90vh; /* Altura máxima */
        overflow-y: auto; /* Permite el desplazamiento vertical si el contenido excede la altura máxima */
    `;

    const NewFormModal = ({ item }) => {
        const [modalId, setModalId] = useState(null);
        const openModal = (id) => {
            setModalId(id);
        };

        const closeModal = () => {
            console.log("Cerrando modal");
            setModalId(null);
        };

        return (
            <>
                <button className="btn btn-primary" onClick={() => openModal(item.id)}>Review</button>
                <Modal isOpen={modalId === item.id} onClose={closeModal}>

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
                            {ratings && ratings.map((option, key) => (
                                <RatingRow
                                    key={key}
                                    option={option}
                                    item={item.id}
                                    isManager={isManager}
                                    isValidator={isValidator}
                                    isCheckboxChecked={isCheckboxChecked}
                                    handleCheckboxChange={handleCheckboxChange}
                                    rangeValues={rangeValues}
                                    setCommnetsValues={setCommnetsValues}
                                    commnetsValues={commnetsValues}
                                    handleRangeChange={handleRangeChange}
                                    handleSubmit={handleSubmit}
                                    changeStatusByRatings={changeStatusByRatings}
                                />
                            ))}
                        </tbody>
                    </table>

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

            {/* {
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
                                            <RatingRow
                                                key={key}
                                                option={option}
                                                item={item}
                                                isManager={isManager}
                                                isValidator={isValidator}
                                                isCheckboxChecked={isCheckboxChecked}
                                                handleCheckboxChange={handleCheckboxChange}
                                                rangeValues={rangeValues}
                                                setCommnetsValues={setCommnetsValues}
                                                commnetsValues={commnetsValues}
                                                handleRangeChange={handleRangeChange}
                                                handleSubmit={handleSubmit}
                                                changeStatusByRatings={changeStatusByRatings}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))
            } */}

        </div>
    )
};

export default FormEmployees;