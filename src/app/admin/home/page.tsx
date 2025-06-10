'use client'
import { Title } from "@/components/Title";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/BreadCrumb";
import { fetchData } from "@/server/services/core/fetchData";
import Reports from "../../../components/Dashboard/Reports";
import TodoList from '@/components/Dashboard/TodoList';
import Profile from '@/components/Dashboard/Profile';
import SelectReview from "@/components/Dashboard/SelectReview";
import Table from "@/components/Dashboard/Table";

const Home = () => {
  const { data: session, status } = useSession()

  //roles
  const isSuper = session?.user?.roles?.some(role => role.name === 'superuser');
  const isManager = session?.user?.roles?.some(role => role.name === 'manager');
  const isAdmin = session?.user?.roles?.some(role => role.name === 'administrator');
  const isApprover = session?.user?.roles?.some(role => role.name === 'approver');
  
  // KPI
  const [teamUser, setTeamUser] = useState({});
  const [reviews, setReviews] = useState([]);
  const [teams, setTeams] = useState([]);
  const [reviewsTeamsEmployees, setReviewsTeamsEmployees] = useState([]);
  const [employeesReviewsTeams, setEmployeesReviewsTeams] = useState([]);
  const [teamsIds, setTeamsId] = useState([])

  //total
  const [totalBudget, setTotalBudget] = useState();
  const [totalTeamAssigned, setTotalTeamAssigned] = useState();
  const [totalEmployeeAssigned, setTotalEmployeeAssigned] = useState();
  const [totalConsumed, setTotalConsumed] = useState();
  const [totalEmployees, setTotalEmployees] = useState();
  const [totalEmployeesCargados, setTotalEmployeesCargados] = useState();
 
  //select
  const [selectedReview, setSelectedReview] = useState("");
  const [lastReviewId, setLastReviewId] = useState();

  //table 
  const [table, setTable] = useState([])

  const userData = async () => {
    try {

      // all teams
      const teamsData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=1000`);
      setTeams(teamsData)
      const userIdToFilter = session?.user.email;

      // todos los teams que tienen al usuario logeado
      const teamUserFilter = teamsData.data.filter(grupo =>
        grupo.users.some(user => user.email === userIdToFilter)
      );

      // teams ID
      const teamIds = teamUserFilter.map(team => team.id);
      setTeamsId(teamIds)

      const teamsFiltrados = teamUserFilter.filter(team => teamIds.includes(team.id));
      const totalEmpleados = teamsFiltrados.reduce((total, team) => {
        return total + (team.employees?.length || 0);
      }, 0);

      setTotalEmployees(totalEmpleados);

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

  const kpiData = async () => {
    try {

      // All reviews
      const reviewsAll = await fetchData(session?.user.token, 'POST', `reviews_all`);
      setReviews(reviewsAll);

      // Ultimo cargado
      const ultimoReview = reviewsAll.reduce((max, item) => {
        return item.id > max.id ? item : max;
      }, reviewsAll[0]);

      setLastReviewId(ultimoReview.id)
      // All reviews teams employees
      const reviewsTeams = await fetchData(session?.user.token, 'POST', `reviews_teams`);
      setReviewsTeamsEmployees(reviewsTeams)

      const reviewTeamEmployeesResponse = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=2000`);
      setEmployeesReviewsTeams(reviewTeamEmployeesResponse)
      
      //resumen review
      const resumenReview = calcularResumenReview(reviewsTeams, ultimoReview.id);
      const updateTable =  calcularTable(reviewsTeams, ultimoReview.id, teamsIds);
      
      setSelectedReview(ultimoReview.id)
      setTable(updateTable)
      setTotalBudget(resumenReview.reviewTotalPrice);
      setTotalTeamAssigned(resumenReview.teamAssigned);
      setTotalEmployeeAssigned(resumenReview.totalAssigned);
      setTotalConsumed(resumenReview.porcentajeConsumido);
  

    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  const calcularResumenReview = (reviewsTeams, selectedId) => {
    // filtered by team_id
    const filtered = reviewsTeams.filter(item =>
      item.review_id == selectedId &&
      teamsIds.includes(Number(item.team_id))
    );
 
    const reviewItem = filtered.find(item => item.review_id == selectedId);
    const reviewTotalPrice = reviewItem?.review_total_price ?? 0;
    const equiposContados = new Set();

    const teamAssigned = filtered
    .reduce((sum, item) => {
      if (!equiposContados.has(item.team_name)) {
        equiposContados.add(item.team_name);
        return sum + (item.team_assigned_price ?? 0);
      }
      return sum;
    }, 0);
    
    const totalAssigned = filtered.reduce((sum, item) => sum + item.employee_assigned_price, 0);
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

  const calcularTable = (reviewsTeams, reviewId, teamsIds) => {

    const resumen = reviewsTeams
    .filter(item =>
      item.review_id == reviewId &&
      teamsIds.includes(item.team_id)
    )
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

  const handleChange = (e) => {
    const selectedId = e.target.value;
    const resumen = calcularResumenReview(reviewsTeamsEmployees, selectedId);

    setSelectedReview(selectedId);
    setTotalBudget(resumen.reviewTotalPrice);
    setTotalTeamAssigned(resumen.teamAssigned);
    setTotalEmployeeAssigned(resumen.totalAssigned);
    setTotalConsumed(resumen.porcentajeConsumido);

    const updateTable =  calcularTable(reviewsTeamsEmployees, selectedId, teamsIds)
    setTable(updateTable)

    const profile = calculateProfile(employeesReviewsTeams, selectedId)
    setTotalEmployees(profile.totalEmployees)
    setTotalEmployeesCargados(profile.totalRatedCount)

  }

  const calculateProfile = (reviewsTeamsResponse: any, selectedId: number) => {
    console.log(reviewsTeamsResponse)
    const rtData = Array.isArray(reviewsTeamsResponse?.data)
      ? reviewsTeamsResponse.data
      : [];

    const teamsIdByReview = [...new Set(
      rtData
        .filter(item =>
          item.reviews_id === selectedId &&
          teamsIds.includes(Number(item.teams_id))
        )
        .map(item => item.teams_id)
    )];

    const totalEmployees = teams.data
      .filter(team => teamsIdByReview.includes(team.id))
      .reduce((sum, team) => sum + (team.employees?.length || 0), 0);

    const totalRatedCount = rtData
      .filter(item =>
        item.reviews_id === selectedId &&
        teamsIds.includes(Number(item.teams_id)) &&
        Number(item.price) !== 0
      ).length;

    return { totalEmployees, totalRatedCount };
  };

  useEffect(() => {
    if (session?.user.token) {
      userData();
    }
  }, [session?.user.token]);

  useEffect(() => {
    if (teams) {
      kpiData();
    }
  }, [teams]);

  useEffect(() => {
    if (teams && lastReviewId) {
      const profile = calculateProfile(employeesReviewsTeams, lastReviewId)
      setTotalEmployees(profile.totalEmployees)
      setTotalEmployeesCargados(profile.totalRatedCount)
    }
  }, [teams]);

  return (
    <div>
      <Breadcrumb />
      <Title>Welcome  {session?.user.email} ! </Title>

      {isApprover || isManager ? <h5>Below you will find all your pending tasks: </h5> : ''}

      {isAdmin || isManager || isSuper ?
        <SelectReview reviews={reviews} selectedReview={selectedReview} setSelectedReview={setSelectedReview} handleChange={handleChange} /> : ''
      }

      {
        (isApprover) && (
          <>
            {/* <Profile totalEmployees={totalEmployees} totalEmployeesCargados={totalEmployeesCargados} /> */}
            <TodoList teamUser={teamUser} />
          </>
        )
      }

      <div className="row">
        {isAdmin || isManager || isSuper ? 
          <Reports presupuesto={totalBudget} teamAsignado={totalTeamAssigned} employeeAsignado={totalEmployeeAssigned} consumido={totalConsumed} />          
          // <Reports teams={teamAll} presupuesto={totalBudget} teamAsignado={totalTeamAssigned} employeeAsignado={totalEmployeeAssigned} consumido={totalConsumed} totalEmployees={totalEmployees} totalEmployeesCargados={totalEmployeesCargados} /> 
        : ''}    
      </div>

      <div className="row">
        {isAdmin || isManager || isSuper ? 
          <Table table={table} />
        : ''}    
      </div>

      <div className="row">
        { isManager ?
          <Profile totalEmployees={totalEmployees} totalEmployeesCargados={totalEmployeesCargados} />
        : ''}    
      </div>

    </div>
  );
};

export default Home;


