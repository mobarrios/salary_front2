'use client'

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { fetchData } from '@/server/services/core/fetchData'
import { apiRequest } from "@/server/services/core/apiRequest";
import { calculateTotalRemaining, calculatePorcent, calculateTotalPrice, calculateTotalsByEmployee, calculateTotalsPercentEmployee, formatSalary } from '@/functions/formEmployeeHandlers';
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';
import { Title } from "@/components/Title";
import { formatPrice } from '@/functions/formatDate';
import Breadcrumb from "@/components/BreadCrumb";
import { Checkbox } from 'primereact/checkbox';
import Swal from 'sweetalert2'

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
    const [meritValues, setMeritValues] = useState({});

    const [color, setColor] = useState('trasparent');
    const [errorRemaining, setErrorRemaining] = useState(false)
    const [loading, setLoading] = useState(false)

    //const team
    const [totalPercent, setTotalPercent] = useState();
    const [totalSpend, setTotalSpend] = useState();
    const [totalRemaining, setTotalRemaining] = useState();
    const [totalApproved, setTotalApprovede] = useState(0);
    const [totalRejected, setTotalRejected] = useState(0);

    // ratings
    const [selectedRatings, setSelectedRatings] = useState({});
    const [ratingRanges, setRatingRanges] = useState({}); // Estado para almacenar min y max

    const [approvedIds, setApprovedIds] = useState([]);
    const [checked, setChecked] = useState();

    const isValidator = session?.user.roles.some(role => role.name === 'approver');
    const isAdmin = session?.user.roles.some(role => role.name === 'administrator');
    const isSuper = session?.user.roles.some(role => role.name === 'superuser');
    const isManager = session?.user.roles.some(role => role.name === 'manager');
    const validatorAndManager = session?.user.roles.some(role => role.name === 'approver' || role.name === 'manager');

    const roles = session?.user.roles;
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    useEffect(() => {

        if (Array.isArray(ratings)) {

            teamEmployees?.forEach(employee => {

                let merit = employee.actual_external_data.overall_score
                let rating = ratings.find(item => item.name == merit);

                if (rating) {
                    setRatingRanges(prevState => ({
                        ...prevState,
                        [employee.id]: {
                            min: rating.percent_min,
                            max: rating.percent_max
                        }
                    }));

                    setSelectedRatings(prevState => ({
                        ...prevState,
                        [employee.id]: rating.id
                    }));
                }
            });
        } else {
            console.warn('ratings no está definido o no es un array');
        }
    }, [ratings, session?.user.token]);


    const updateEmployeesTeams = async (team) => {

        const promises = team.employees.map(item =>
            fetchData(session?.user.token, 'GET', `employees/${item.id}`)
        );

        const teamResponses = await Promise.all(promises);
        setTeamEmployees(teamResponses)

        const newSalaryValues = {};
        const newMeritValues = {};
        // Iterar sobre las respuestas y guardar el id y el salary
        teamResponses.forEach(employee => {
            let merit = employee.actual_external_data.overall_score
            newMeritValues[employee.id] = merit
            newSalaryValues[employee.id] = formatSalary(employee.actual_external_data.annual_salary);
        });
        setSalaryValues(newSalaryValues)
        setMeritValues(newMeritValues)
    }

    const load = async () => {
        setLoading(true);
        try {
            // team
            const teamResponse = await fetchData(session?.user.token, 'GET', `teams/${team_id}`);
            console.log('teamResponse', teamResponse)
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

        const { totalPrice } = calculateTotalPrice(updatePriceValues);
        const { totalPercentSum } = calculateTotalsPercentEmployee(updatedPercentValues)

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

    // const handleSubmit = async (employeesId) => {
    //     let employeesSalary = teamEmployees.find(item => item.id == parseInt(employeesId));
    //     if (!employeesSalary) {
    //         return;
    //     }

    //     // Validar campos requeridos
    //     const currentRating = selectedRatings[employeesId];
    //     const currentRangeValue = rangeValues[employeesId];

    //     const newErrors = {};
    //     if (!currentRating) {
    //         newErrors.rating = 'Required.';
    //     }
    //     if (currentRangeValue === undefined || currentRangeValue === '') {
    //         newErrors.range = 'Required.';
    //     }

    //     setErrors(prevErrors => ({
    //         ...prevErrors,
    //         [employeesId]: newErrors
    //     }));

    //     if (Object.keys(newErrors).length > 0) {
    //         console.log('error');
    //         return;
    //     }

    //     // Si no hay errores, continuar con el envío
    //     let currentSalary = calculatePriceByEmployee(employeesId);
    //     let ratingId = selectedRatings[employeesId];
    //     let percent = rangeValues[employeesId];

    //     const payload = {
    //         reviews_id: reviews_id,
    //         teams_id: team_id,
    //         ratings_id: ratingId,
    //         employees_id: employeesId,
    //         price: currentSalary,
    //         percent: percent,
    //     };

    //     // solo validar el employees
    //     const existingRecord = ratingsTeamEmployees.find(r =>
    //         r.employees_id === employeesId
    //     );

    //     try {
    //         let response;

    //         if (existingRecord) {
    //             response = await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);

    //             setRatingsTeamEmployees(prevState =>
    //                 prevState.map(item =>
    //                     item.id === existingRecord.id ? { ...item, ...payload } : item
    //                 )
    //             );
    //         } else {
    //             response = await apiRequest(`reviews_teams_employees/`, 'POST', payload);

    //             setRatingsTeamEmployees(prevState => [...prevState, { ...payload, id: response.id }]);
    //         }

    //     } catch (error) {
    //         console.error('Error al enviar datos:', error);
    //     }
    //     showSuccessAlert("Your work has been saved");
    //     setErrors('')
    // };

    const handleSubmit = async (employeesId = null) => {
        // Determina si procesar uno o todos
        const employeesToProcess = employeesId
            ? [teamEmployees.find(item => item.id == parseInt(employeesId))].filter(Boolean)
            : teamEmployees;
    
        const updatedErrors = {};
        const validEmployees = [];
    
        for (const employee of employeesToProcess) {
            const id = employee.id;
            const currentRating = selectedRatings[id];
            const currentRangeValue = rangeValues[id];
            const newErrors = {};
    
            if (!currentRating) {
                newErrors.rating = 'Required.';
            }
            if (currentRangeValue === undefined || currentRangeValue === '') {
                newErrors.range = 'Required.';
            }
            
            //validEmployees.push(employee);

            // if (Object.keys(newErrors).length > 0) {
            //     updatedErrors[id] = newErrors;
            // } else {
            //     validEmployees.push(employee);
            // }
            if (Object.keys(newErrors).length > 0) {
                updatedErrors[id] = newErrors;
            }
            
            validEmployees.push(employee);
            
        }
    
        // Mostrar solo errores de los inválidos
        setErrors(prevErrors => ({
            ...prevErrors,
            ...updatedErrors
        }));
    
        // Si no hay ningún empleado válido, no continuar
        // if (validEmployees.length === 0) {
        //     console.log('No hay datos válidos para guardar.');
        //     return;
        // }
        setIsSubmitting(true);
        // Procesa los empleados válidos
        try {
            for (const employee of validEmployees) {
                const id = employee.id;
                const currentSalary = calculatePriceByEmployee(id);
                const ratingId = selectedRatings[id];
                const percent = rangeValues[id];
                const validatedPercent = percent === '' ? 0 : percent;

                const payload = {
                    reviews_id: reviews_id,
                    teams_id: team_id,
                    ratings_id: ratingId,
                    employees_id: id,
                    price: currentSalary,
                    percent: validatedPercent,
                };
    
                const existingRecord = ratingsTeamEmployees.find(r => r.employees_id === id);
                let response;
    
                if (existingRecord) {
                    //console.log(existingRecord.id, payload)
                    response = await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);
                    //console.log('Edit',response)
                    setRatingsTeamEmployees(prevState =>
                        prevState.map(item =>
                            item.id === existingRecord.id ? { ...item, ...payload } : item
                        )
                    );
                } else {
                    response = await apiRequest(`reviews_teams_employees/`, 'POST', payload);
                    //console.log('POST',response)
                    setRatingsTeamEmployees(prevState => [...prevState, { ...payload, id: response.id }]);
                }
            }
    
            showSuccessAlert("Valid data has been saved.");
        } catch (error) {
            console.error('Error al enviar datos:', error);
        } finally {
            setIsSubmitting(false); 
        }
    };
    


    const changeValueSelect = async (employeeId, event) => {

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

    }

    const handleSelectChange = async (employeeId, event) => {

        const selectedId = selectedRatings[employeeId]

        const payload = {
            reviews_id: reviews_id,
            teams_id: team_id,
            ratings_id: selectedId,
            employees_id: employeeId,
            price: 0,
            percent: 0,
        };

        // solo validar el employees
        const existingRecord = ratingsTeamEmployees.find(r =>
            r.employees_id === employeeId
        );

        try {
            let response;

            if (existingRecord) {
                response = await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);

                setRatingsTeamEmployees(prevState =>
                    prevState.map(item =>
                        item.id === existingRecord.id ? { ...item, ...payload } : item
                    )
                );
            } else {
                response = await apiRequest(`reviews_teams_employees/`, 'POST', payload);

                setRatingsTeamEmployees(prevState => [...prevState, { ...payload, id: response.id }]);
            }

        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
        showSuccessAlert("Your work has been saved");

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

    const changeStatusByRatings = async (employeesId, status, isDeleted = false) => {

        let ratingId = selectedRatings[employeesId]

        const payload = {
            status: status,
            percent: status === 3 ? null : undefined, // Enviar percent como 0 solo si status es 3, de lo contrario, undefined
            price: status === 3 ? null : undefined // Enviar percent como 0 solo si status es 3, de lo contrario, undefined

        };

        // Verificar si el registro ya existe
        const existingRecord = ratingsTeamEmployees.find(r =>
            r.ratings_id == ratingId && r.employees_id == employeesId && r.reviews_id == reviews_id && r.teams_id == team_id
        );

        try {
            if (existingRecord) {
                const previousStatus = statusValues[employeesId];

                const response = await apiRequest(`reviews_teams_employees/edit/${existingRecord.id}`, 'PUT', payload);
                //console.log(response)
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
            } else {
                if (isDeleted) {

                    const payload = {
                        reviews_id: reviews_id,
                        teams_id: team_id,
                        ratings_id: ratingId,
                        employees_id: employeesId,
                        price: 0,
                        percent: 0,
                        status: 3
                    };

                    const response = await apiRequest(`reviews_teams_employees/`, 'POST', payload);

                    setRatingsTeamEmployees(prevState => [...prevState, { ...payload, id: response.id }]);
                    setStatusValues(prevState => ({
                        ...prevState,
                        [employeesId]: status
                    }));

                }
            }

            if (status === 3) {
                setRangeValues(prevState => {
                    const updatedRangeValues = {
                        ...prevState,
                        [employeesId]: 0 // Actualiza el valor específico del empleado
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
            }

        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    };

    const findStatusByRatings = (employeeId) => {

        const status = statusValues[employeeId];
        let statusText = '';
        if (status === 1) {
            statusText = <span className="badge rounded-pill bg-success">approved</span>;
        } else if (status === 2) {
            statusText = <span className="badge rounded-pill bg-danger">rejected</span>;
        } else if (status === 0) {
            statusText = <span className="badge rounded-pill bg-secondary">pending</span>;
        }

        return statusText
    }

    const changeStatusByReview = async (status) => {

        const valuesData = {
            status: status,
        }

        try {

            const resp = await apiRequest(`reviews_teams/edit/${reviewTeam.id}`, 'PUT', valuesData)
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
    }

    const getInputClassName = (itemId) => {
        const value = rangeValues[itemId];
        const ratingId = selectedRatings[itemId];
        const selectedRating = ratings.find(option => option.id == ratingId);

        const isOutOfRange = Number(value) > (selectedRating?.percent_max || 0) ||
            Number(value) < (selectedRating?.percent_min || 0);

        return `form-control ${isOutOfRange ? 'text-danger' : ''}`;

    };

    const canSendToApprover = (roles, reviewTeam) => {
        return roles?.some(role => ['superuser', 'administrator', 'manager'].includes(role.name)) && reviewTeam?.status === 1;
    };

    const canSendToDone = (roles, reviewTeam) => {
        return roles?.some(role => ['superuser', 'administrator', 'approver'].includes(role.name)) && reviewTeam?.status === 2;
    };

    const canChangeStatus = roles?.some(role => ['superuser', 'approver', 'administrador'].includes(role.name));
    const canChangePercent = roles?.some(role => ['superuser', 'administrador'].includes(role.name));

    const countValues = Object.keys(rangeValues).length;

    const isInputDisabled = () => {

        // bloqueo si el status es 2

        //habilito si es admin

        if (isAdmin || isSuper) {
            return false;
        }

        if ((isValidator || validatorAndManager) && reviewTeam?.status === 2) {
            return false;
        }

        return true
        // Si es Admin, nunca debe estar deshabilitado
        // if (isAdmin) {
        //     return false;
        // }

        // // si es true se deshabilita
        // if (isManager) {
        //     return true;
        // }

        // if(validatorAndManager){
        //     return false
        // }

        // // Deshabilitar para Validator si el status es 3
        // if (isValidator && reviewTeam?.status === 2) {
        //     return false;
        // }

        // return true;
    };

    const enableRatings = (employeeId) => {
    
        // Regla 1: Admin o Superuser siempre pueden editar
        if (isAdmin || isSuper) {
            return false; // false = habilitado
        }
    
        // Regla 2: Si es tanto Approver como Manager, se habilita
        if (isValidator) {
            return true;
        }
    
        // Regla 4: Caso especial por estado
        if (isManager && (reviewTeam.status === 1 || statusValues[employeeId] === 2)) {
            return false;
        }
    
        // Por defecto, deshabilitado
        return true;
    };

    //habilitar porcentaje segun rol
    const enablePercent = (employeeId) => {

        // si es true se deshabilita
        // if (isValidator) {
        //     return true
        // }

        // if (isAdmin) {
        //     return false;
        // }

        // if(validatorAndManager){
        //     return false
        // }

        // approved == 1
        // rejected  == 2

        if (canChangePercent) {
            return false;
        }

        if (isManager && reviewTeam.status === 1 || statusValues[employeeId] === 2) {
            return false;
        }

        return true;

    };

    const checkAllValidation = () => {

        if (countNotStatusThree === totalApproved) {
            return true
        }

        if (reviewTeam?.status === 3) {
            return true
        }


    }

    const checkAll = async (e) => {

        setChecked(e.checked);

        let newTotalApproved = 0;
        let newStatusValues = {};

        // Recorre el array de empleados y cuenta los status
        await Promise.all(ratingsTeamEmployees.map(async item => {
            let employeesId = item.employees_id;
            let status = 1; // Aprobado
            const previousStatus = statusValues[employeesId];

            if (item.status !== 1) {
                await apiRequest(`reviews_teams_employees/edit/${item.id}`, 'PUT', { status: 1 });

            }
            //console.log(previousStatus);

            if (status === 1) { // Aprobado
                newTotalApproved += 1;
            }

            newStatusValues[employeesId] = status;
        }));

        // Actualiza el estado global una vez completadas todas las operaciones
        setStatusValues(prevState => ({
            ...prevState,
            ...newStatusValues
        }));
        setTotalApprovede(newTotalApproved); // Actualiza el total de aprobados
        setTotalRejected(0);  // Actualiza el total de rechazados
    };

    const confirmDelete = async () => {
        const message = await Swal.fire({
            title: "Are you sure to delete this record?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });
        return message.isConfirmed;
    };

    const handleDelete = async (itemId, status, isDeleted) => { // Cambia aquí para usar nombres de parámetros
        try {
            const confirmed = await confirmDelete();
            if (confirmed) {
                const resp = await changeStatusByRatings(itemId, status, isDeleted); // Asegúrate de definir deleteRecord
                if (resp.ok) {
                    // onDelete(); // Si tienes una función para manejar la eliminación, descomenta esto
                    Swal.fire({
                        title: "Delete!",
                        icon: "success"
                    });
                }
            }
        } catch (error) {
            console.log("error ===> ", error);
        }
    };

    const meritChecked = (employeeId) => {

        let ratingSelected;

        if (selectedRatings[employeeId]) {
            ratingSelected = selectedRatings[employeeId]
        } else if (meritValues[employeeId]) {

            let rating = ratings.find(item => item.name === meritValues[employeeId]);
            let ratingsId = rating ? rating.id : null; // Devuelve el ID o null si no se encuentra

            ratingSelected = ratingsId
        } else {
            ratingSelected = ''
        }

        return ratingSelected;
    }

    const countNotStatusThree = teamEmployees?.filter(item => statusValues[item.id] !== 3).length;

    return (
        <div className="row">
            {loading ? (
                <div>Cargando...</div>
            ) : (
                <>
                    <Breadcrumb items={bc} />

                    <Title>Reviews - {team?.name}</Title>

                    <div className='col-12 mt-5'>

                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Total amount to assign</th>
                                    <th>Total percent</th>
                                    <th>Total Spend</th>
                                    <th>Total Remaining</th>
                                    <th>Compliant </th>
                                    <th>Noncompliant </th>
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
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    teamEmployees && teamEmployees
                                        .filter(item => statusValues[item.id] !== 3) // Filtrar empleados
                                        .map((item) => (
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
                                                <td>
                                                    <select
                                                        disabled={enableRatings(item.id)}
                                                        required
                                                        className="form-control"
                                                        style={{ width: '100%' }}
                                                        value={meritChecked(item.id)}
                                                        onChange={(e) => changeValueSelect(item.id, e)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleSelectChange(item.id, e);
                                                            }
                                                        }}
                                                    >
                                                        <option value="" label="Select an option" />
                                                        {ratings && ratings.map((option) => (
                                                            <option key={option.id} value={option.id} label={option.name} />
                                                        ))}
                                                    </select>
                                                    {errors[item.id]?.rating && <div className="text-danger">{errors[item.id].rating}</div>}
                                                </td>
                                                <td>
                                                    <input
                                                        required
                                                        min={0}
                                                        disabled={enablePercent(item.id)}
                                                        type='number'
                                                        step={1}
                                                        className={getInputClassName(item.id)}
                                                        style={{ width: '150px', margin: '0 5px' }}
                                                        value={rangeValues[item.id]}
                                                        placeholder={`min ${ratingRanges[item.id]?.min || 0} - max ${ratingRanges[item.id]?.max || 0}`}
                                                        onChange={(e) => handleInputChange(e, item.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleSubmit(item.id); // Llama a handleSubmit con el id del empleado
                                                            }
                                                        }}
                                                    />
                                                    {errors[item.id]?.range && <div className="text-danger">{errors[item.id].range}</div>}
                                                </td>
                                                <td>
                                                    {findStatusByRatings(item.id)}
                                                </td>

                                                {canChangeStatus && (
                                                    <td>
                                                        <>
                                                            <a
                                                                className={`btn btn-light btn-xs m-1 ${isInputDisabled() ? 'disabled' : ''}`}
                                                                onClick={(e) => { changeStatusByRatings(item.id, 1); }}>
                                                                <i className={`bi bi-hand-thumbs-up ${statusValues[item.id] == 1 ? 'text-success' : ''}`}></i>
                                                            </a>
                                                            <a
                                                                className={`btn btn-light btn-xs m-1 ${isInputDisabled() ? 'disabled' : ''}`}
                                                                onClick={(e) => { changeStatusByRatings(item.id, 2); }}>
                                                                <i className={`bi bi-hand-thumbs-down ${statusValues[item.id] == 2 ? 'text-danger' : ''}`}></i>
                                                            </a>
                                                        </>
                                                    </td>
                                                )}

                                                {(isAdmin || isSuper) && (
                                                    <td>
                                                        <a
                                                            className="btn btn-light btn-xs m-1"
                                                            onClick={() => handleDelete(item.id, 3, true)}>
                                                            <i className={`bi bi-x-circle text-danger`}></i>
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

            <div className="col-12">
                <div className="bg-white">
                    
                    {
                        isValidator && reviewTeam?.status === 2 && (
                            <>
                                <Checkbox
                                    onChange={e => checkAll(e)}
                                    checked={countNotStatusThree === totalApproved ? checked : false}
                                    disabled={checkAllValidation()}
                                />
                                <span> Approve all</span>
                            </>
                        )
                    }

                    {
                        canSendToApprover(roles, reviewTeam) &&
                        (<a
                            onClick={() => changeStatusByReview(2)}
                            className={`btn btn-primary mt-3 float-end ${countNotStatusThree === countValues ? '' : 'disabled'} `}
                        >
                            <i className="bi bi-save"></i> Send to approver
                        </a>)
                    }

                    {
                        canSendToDone(roles, reviewTeam) && (<a
                            onClick={() => changeStatusByReview(3)}
                            className={`btn btn-primary mt-3 float-end ${countNotStatusThree === totalApproved ? '' : 'disabled'}  `}
                        >
                            <i className="bi bi-save"></i> Submit
                        </a>)
                    }

                    {
                        (
                            isAdmin || isSuper || (isManager && reviewTeam?.status !== 3)
                        ) && (
                            <a
                                onClick={() => !isSubmitting && handleSubmit()}
                                className={`btn btn-outline-primary mt-3 mx-2 float-end ${isSubmitting ? 'disabled' : ''}`}
                                style={{ pointerEvents: isSubmitting ? 'none' : 'auto', opacity: isSubmitting ? 0.6 : 1 }}
                            >
                                <i className="bi bi-save"></i> {isSubmitting ? 'Saving...' : 'Save all'}
                            </a>
                        )
                    }

                    {
                        reviewTeam?.status === 3 && (
                            <span className="badge rounded-pill bg-success float-end p-3 mt-3 " style={{ fontSize: '1.0rem' }}>
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

