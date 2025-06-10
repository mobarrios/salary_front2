'use client'
import { Title } from "@/components/Title";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/BreadCrumb";
import { apiRequest } from '@/server/services/core/apiRequest';
import { fetchData } from "@/server/services/core/fetchData";
import { formatDate } from "@/functions/formatDate";
import Reports from "../../../components/Dashboard/Reports";
import ReviewTeam from "../reviews/teams/page";

const Home = () => {
  const { data: session, status } = useSession()

  //roles
  const isSuper = session?.user?.roles?.some(role => role.name === 'superuser');
  const isManager = session?.user?.roles?.some(role => role.name === 'manager');
  const isAdmin = session?.user?.roles?.some(role => role.name === 'administrator');
  const isApprover = session?.user?.roles?.some(role => role.name === 'approver');
  const validatorAndManager = session?.user?.roles?.some(role => role.name === 'approver' && role.name === 'manager');

  const [teamUser, setTeamUser] = useState({});
  const [teamAll, setTeamAll] = useState([]);
  const [teams, setTeams] = useState();
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");
  const [reviewsTeams, setReviewsTeams] = useState([]);
  const [reviewsTeamsEmployees, setReviewsTeamsEmployees] = useState([]);
  const [filteredTeamUser, setFilteredTeamUser] = useState([]);

  //total filtered for review
  const [totalBudget, setTotalBudget] = useState();
  const [totalTeamAssigned, setTotalTeamAssigned] = useState();
  const [totalEmployeeAssigned, setTotalEmployeeAssigned] = useState();
  const [totalConsumed, setTotalConsumed] = useState();
  const [totalEmployees, setTotalEmployees] = useState();
  const [totalEmployeesCargados, setTotalEmployeesCargados] = useState();
  const [teamsId, setTeamsId] = useState();

  const userData = async () => {
    try {

      // all teams
      const teamsData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=1000`);
      console.log(teamsData);
      setTeams(teamsData)
      const userIdToFilter = session?.user.email;

      // todos los teams que tienen al usuario logeado
      const teamUserFilter = teamsData.data.filter(grupo =>
        grupo.users.some(user => user.email === userIdToFilter)
      );

      const teamIds = teamUserFilter.map(team => team.id);
      const reviewTeamsResponse = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=1000`);

      const filteredReviewTeams = reviewTeamsResponse.data
        .filter(reviewTeam =>
          teamIds.includes(Number(reviewTeam.teams_id)) && reviewTeam.status === 2
        )
        .map(reviewTeam => {
          const team = teamUserFilter.find(team => team.id === Number(reviewTeam.teams_id));
          return {
            ...reviewTeam,
            teamName: team ? team.name : null
          };
        });

      const sortedReviewTeams = filteredReviewTeams.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setTeamUser(sortedReviewTeams)

    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (session?.user.token) {
      userData();
      //infoData();
    }
  }, [session?.user.token]);

  useEffect(() => {
    if (teams && session?.user.token) {
      infoData();
    }
  }, [teams]);


  const infoData = async () => {
    try {

      // all teams
      const reviewsAll = await fetchData(session?.user.token, 'POST', `reviews_all`);
      setReviews(reviewsAll);

      // Ultimo cargado
      const ultimoReview = reviewsAll.reduce((max, item) => {
        return item.id > max.id ? item : max;
      }, reviewsAll[0]);

      // all reviews teams employees
      const reviewsTeams = await fetchData(session?.user.token, 'POST', `reviews_teams`);
      
      setReviewsTeams(reviewsTeams)

      // Calcular resumen inicial y actualizar estados
      const resumenReview = calcularResumenReview(reviewsTeams, ultimoReview.id);

      setSelectedReview(ultimoReview.id);
      setTotalBudget(resumenReview.reviewTotalPrice);
      setTotalTeamAssigned(resumenReview.teamAssigned);
      setTotalEmployeeAssigned(resumenReview.totalAssigned);
      setTotalConsumed(resumenReview.porcentajeConsumido);

      // reviews teams employees
      const reviewTeamEmployeesResponse = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=2000`);
      setReviewsTeamsEmployees(reviewTeamEmployeesResponse)

      // agrupar por teams
      const teamsIds = [
        ...new Set(
          reviewTeamEmployeesResponse.data
            .filter(item => item.reviews_id === ultimoReview.id)
            .map(item => item.teams_id)
        )
      ];

      setTeamsId(teamsIds);

      // userId
      const userIdToFilter = session?.user.id;

      // todos los teams que tienen al usuario logeado
      const teamUserFilter = teams.data.filter(grupo =>
        grupo.users.some(user => user.id === userIdToFilter)
      );
      
      setFilteredTeamUser(teamUserFilter)
      console.log('teams', teams.data)
      const teamsFiltrados = teamUserFilter.filter(team => teamsIds.includes(team.id));
      const totalEmpleados = teamsFiltrados.reduce((total, team) => {
        return total + (team.employees?.length || 0);
      }, 0);

      setTotalEmployees(totalEmpleados);

      //count by teams
      const filterRatingEmployees = reviewTeamEmployeesResponse.data.filter(
        item => item.reviews_id === ultimoReview.id && item.price !== 0
      );

      setTotalEmployeesCargados(filterRatingEmployees.length)

      const resumen = calcularTable(reviewsTeams, ultimoReview.id, teamsIds)
      setTeamAll(resumen)

    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  const calcularTable = (reviewsTeams, reviewId, teamsIds) => {
    console.log('reviewsTeams', reviewsTeams)
    console.log('teamsId', teamsIds)
    console.log('reviewId', reviewId)

    const resumen = reviewsTeams
      .filter(item =>
        item.review_id == reviewId &&
        teamsIds.includes(item.team_id)
      )
      // .filter(item => 
      //   item.review_id == reviewId
      // )
      .reduce((acc, item) => {
        const team = item.team_name;

        if (!acc[team]) {
          acc[team] = {
            team_name: team,
            total_employee_assigned_price: 0,
            team_assigned_price: item.team_assigned_price
          };
        }

        acc[team].total_employee_assigned_price += item.employee_assigned_price;

        return acc;
      }, {});

    console.log('resumen', resumen)
    // Agregar % consumido
    const resultadoFinal = Object.values(resumen).map(item => {
      const consumed_percentage =
        item.team_assigned_price > 0
          ? ((item.total_employee_assigned_price / item.team_assigned_price) * 100).toFixed(2)
          : '0.00';

      return {
        ...item,
        consumed_percentage: consumed_percentage
      };
    });

    return resultadoFinal;
  };

  const calcularResumenReview = (reviewsTeams, selectedId) => {
    const reviewItem = reviewsTeams.find(item => item.review_id == selectedId);
    const reviewTotalPrice = reviewItem?.review_total_price ?? 0;
    //const teamAssigned = reviewItem?.team_assigned_price ?? 0;

    const equiposContados = new Set();

    const teamAssigned = reviewsTeams
      .filter(item => item.review_id == selectedId)
      .reduce((sum, item) => {
        if (!equiposContados.has(item.team_name)) {
          equiposContados.add(item.team_name);
          return sum + (item.team_assigned_price ?? 0);
        }
        return sum;
      }, 0);

    const totalAssigned = reviewsTeams
      .filter(item => item.review_id == selectedId)
      .reduce((sum, item) => sum + item.employee_assigned_price, 0);

    const porcentajeConsumido = teamAssigned > 0
      ? ((totalAssigned / teamAssigned) * 100).toFixed(2)
      : "0.00";

    return {
      reviewTotalPrice,
      teamAssigned,
      totalAssigned,
      porcentajeConsumido
    };
  };

  const handleChange = (e) => {
    const selectedId = e.target.value;

    const resumen = calcularResumenReview(reviewsTeams, selectedId);

    setSelectedReview(selectedId);
    setTotalBudget(resumen.reviewTotalPrice);
    setTotalTeamAssigned(resumen.teamAssigned);
    setTotalEmployeeAssigned(resumen.totalAssigned);
    setTotalConsumed(resumen.porcentajeConsumido);

    const updateTable = calcularTable(reviewsTeams, selectedId)
    setTeamAll(updateTable)

    const teamsIds = [
      ...new Set(
        reviewsTeamsEmployees.data
          .filter(item => item.reviews_id == selectedId)
          .map(item => item.teams_id)
      )
    ];

    setTeamsId(teamsIds);

    // userId
    const userIdToFilter = session?.user.email;

    // todos los teams que tienen al usuario logeado
    const teamUserFilter = teams.data.filter(grupo =>
      grupo.users.some(user => user.id == userIdToFilter)
    );
    setFilteredTeamUser(teamUserFilter)

    const teamsFiltrados = teamUserFilter.filter(team => teamsIds.includes(team.id));
    const totalEmpleados = teamsFiltrados.reduce((total, team) => {
      return total + (team.employees?.length || 0);
    }, 0);

    setTotalEmployees(totalEmpleados);

    //count by teams
    const filterRatingEmployees = reviewsTeamsEmployees.data.filter(
      item => item.reviews_id == selectedId && item.price !== 0
    );

    setTotalEmployeesCargados(filterRatingEmployees.length)

  };

  return (
    <div>
      <Breadcrumb />
      <Title>Welcome  {session?.user.email} ! </Title>

      {isApprover || validatorAndManager ? <h5>Below you will find all your pending tasks: </h5> : ''}

      {isAdmin || isManager || isSuper ?
        <div className="row mt-4">
          <div className='col-6'></div>
          <div className='col-6'>
            <div className="mb-3 text-end">
              <label htmlFor="review-select" className="form-label">Review Cycle </label>
              <select
                id="review-select"
                className="form-select"
                value={selectedReview}
                onChange={handleChange}
                style={{ width: 'auto', display: 'inline-block' }} // opcional para achicar
              >
                <option value="">Seleccione una review</option>
                {reviews.map((review) => (
                  <option key={review.id} value={review.id}>
                    {review.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        : ''
      }

      <div className="row mt-4">
        <div className='col-12'>
          {
            (isApprover || validatorAndManager) && (
              teamUser.length > 0 && teamUser?.map((review, id) => (
                <>
                  <div className="row m-2" key={review.id}>
                    <div className="col-3">
                      {review.teamName}
                    </div>
                    <div className="col-3">
                      {formatDate(review.created_at)}
                    </div>
                    <div className="col-4">
                      <span className="badge rounded-pill bg-danger">Pending</span>
                    </div>
                    <div className="col-2">
                      <a
                        href={`/admin/reviews/teams/${review.teams_id}/${review.reviews_id}`}
                        className="btn btn-success ms-2">
                        <i className="bi bi-pencil"></i>
                      </a>
                    </div>
                  </div>
                </>
              ))
            )
          }
        </div>
      </div>

      <div className="row">
        {isAdmin || isManager || isSuper ?
          <Reports teams={teamAll} presupuesto={totalBudget} teamAsignado={totalTeamAssigned} employeeAsignado={totalEmployeeAssigned} consumido={totalConsumed} totalEmployees={totalEmployees} totalEmployeesCargados={totalEmployeesCargados} />
          : ''}
      </div>
    </div>
  );
};

export default Home;


