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

interface Employee {
  id: number;
  email: string;
  name: string;
}

interface Team {
  id: number;
  name: string;
  users: Employee[];
  employees: Employee[];
}

interface ReviewTeamEmployee {
  id: number;
  teams_id: string;
  review_id: string;
  employees_id: number;
  price: number;
  percent: number;
  status: number;
  comments?: string;
}

interface TeamCount {
  [key: string]: number;
}

interface TableItem {
  team_id: number;
  team_name: string;
  total_employee_assigned_price: number;
  team_assigned_price: number;
  consumed_percentage: string;
}

const Home = () => {
  const { data: session, status } = useSession()

  //roles
  const isSuper = session?.user?.roles?.some(role => role.name === 'superuser');
  const isManager = session?.user?.roles?.some(role => role.name === 'manager');
  const isAdmin = session?.user?.roles?.some(role => role.name === 'administrator');
  const isApprover = session?.user?.roles?.some(role => role.name === 'approver');
  const canViewCompleteColumn = isManager || isSuper || isAdmin;
  const canViewApproverColumn = isApprover || isSuper || isAdmin;

  // KPI
  const [teamUser, setTeamUser] = useState([]);
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
 
  //select
  const [selectedReview, setSelectedReview] = useState("");
  const [lastReviewId, setLastReviewId] = useState();
  const [review, setReview] = useState([]);
  const [reviewsTeams, setReviewsTeams] = useState([]);
  const [reviewTeam, setReviewTeam] = useState([]);

  interface TeamCount {
    [key: string]: number;
  }

  interface TableItem {
    team_id: number;
    team_name: string;
    total_employee_assigned_price: number;
    team_assigned_price: number;
    consumed_percentage: string;
  }

  //table 
  const [table, setTable] = useState<TableItem[]>([]);
  const [totalEmployeesByTeams, setTotalEmployeesByTeams] = useState<TeamCount>({});
  const [totalProfileByTeams, setProfileEmployeesByTeams] = useState<TeamCount>({});
  const [totalApprovedByTeams, setTotalApprovedByTeams] = useState<TeamCount>({});

  //profile
  const [totalEmployees, setTotalEmployees] = useState();
  const [totalEmployeesCargados, setTotalEmployeesCargados] = useState();
  const [totalEmployeesCargadosApproved, setTotalEmployeesCargadosApproved] = useState();
  const [missingApproved, setMissingApproved] = useState();

  const userData = async (currentLastReviewId) => {
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

      const reviewTeamEmployeesResponse = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=2000`);
          
      // 1. Manejo seguro de la respuesta y filtrado
      const filteredEmployees = Array.isArray(reviewTeamEmployeesResponse?.data) 
          ? reviewTeamEmployeesResponse.data.filter(employee => {
                return employee.reviews_id == currentLastReviewId;
            })
          : []; // Usa un array vacío si los datos no son válidos

      const totalEmpleadosAsignados = filteredEmployees.length;

      // 3. Calcular el conteo agrupado por team_id
      const employeeCountByTeam = filteredEmployees.reduce((acc, currentItem) => {
          const teamId = Number(currentItem.teams_id); 
          acc[teamId] = (acc[teamId] || 0) + 1;
          return acc;
      }, {} as Record<number, number>);

      setTotalEmployeesByTeams(employeeCountByTeam);
      setTotalEmployees(totalEmpleadosAsignados);

      const reviewTeamsResponse = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=1000`);
      setReviewsTeams(reviewTeamsResponse)
      
      const filteredReviewTeams = reviewTeamsResponse.data
        .filter(reviewTeam =>
          //teamIds.includes(Number(reviewTeam.teams_id)) && reviewTeam.status === 2
          teamIds.includes(Number(reviewTeam.teams_id))
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

  const calculateEmployeeCounts = (
    employeesData: any[], // Usamos 'any[]' por simplicidad si el tipo exacto no está disponible
    reviewId: string | number, 
      managerTeamIds: number[]
  ): { conteoPorEquipo: Record<number, number>; totalEmpleadosAsignados: number } => {
      
      const filteredEmployees = employeesData.filter(employee => {
          return employee.review_id == reviewId;
      });
 
      const totalEmpleadosAsignados = filteredEmployees.length;
     
      // 3. Calcular el conteo agrupado por team_id
      const employeeCountByTeam = filteredEmployees.reduce((acc, currentItem) => {
          // Aseguramos que teamId sea un número o convertimos si es necesario
          const teamId = Number(currentItem.team_id); 
          acc[teamId] = (acc[teamId] || 0) + 1;

          return acc;
      }, {} as Record<number, number>);
     
      return { 
          conteoPorEquipo: employeeCountByTeam, 
          totalEmpleadosAsignados: totalEmpleadosAsignados 
      };
  };

  const kpiData = async () => {
    try {      
      // All reviews teams employees
      const reviewsTeams = await fetchData(session?.user.token, 'POST', `reviews_teams`);
      
      setReviewsTeamsEmployees(reviewsTeams)

      const reviewTeamEmployeesResponse = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=2000`);
      setEmployeesReviewsTeams(reviewTeamEmployeesResponse)
        
      //resumen review
      const resumenReview = calcularResumenReview(reviewsTeams, lastReviewId);
      const updateTable =  calcularTable(reviewsTeams, lastReviewId, teamsIds);
           
      setSelectedReview(lastReviewId)
      setTable(updateTable)
      setTotalBudget(resumenReview.reviewTotalPrice);
      setTotalTeamAssigned(resumenReview.teamAssigned);
      setTotalEmployeeAssigned(resumenReview.totalAssigned);
      setTotalConsumed(resumenReview.porcentajeConsumido);
      
      const profile = calculateProfileManager(reviewTeamEmployeesResponse, lastReviewId)
      setTotalEmployees(profile.totalEmployees)
      setTotalEmployeesCargados(profile.totalRatedCount)
      setProfileEmployeesByTeams(profile.result)

      const approved = calculateProfileApproved(reviewTeamEmployeesResponse, lastReviewId)
      setMissingApproved(approved.totalEmployees)
      //setTotalEmployees(approved.totalEmployees)
      setTotalEmployeesCargadosApproved(approved.totalRatedCount)
      setTotalApprovedByTeams(approved.result)
      
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
      const teamId = item.team_id;

      if (!acc[teamId]) {
        acc[teamId] = {
          team_id: teamId,
          team_name: item.team_name,
          total_employee_assigned_price: 0,
          team_assigned_price: item.team_assigned_price
        };
      }

      acc[teamId].total_employee_assigned_price += item.employee_assigned_price;

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
    
    // Ultimo cargado
    const selectedReview = reviews.find(item => item.id == selectedId);
    setReview(selectedReview)

    // Review team
    const selectedReviewTeam = reviewsTeams.data.find(item => item.reviews_id == selectedId);
    setReviewTeam(selectedReviewTeam)

    const resumen = calcularResumenReview(reviewsTeamsEmployees, selectedId);

    setSelectedReview(selectedId);
    setTotalBudget(resumen.reviewTotalPrice);
    setTotalTeamAssigned(resumen.teamAssigned);
    setTotalEmployeeAssigned(resumen.totalAssigned);
    setTotalConsumed(resumen.porcentajeConsumido);

    const updateTable =  calcularTable(reviewsTeamsEmployees, selectedId, teamsIds)
    setTable(updateTable)

    // TOTAL
    const { conteoPorEquipo, totalEmpleadosAsignados } = calculateEmployeeCounts(
    reviewsTeamsEmployees, 
    selectedId, 
    teamsIds
    );

    setTotalEmployeesByTeams(conteoPorEquipo);
    setTotalEmployees(totalEmpleadosAsignados);
    

    const manager = calculateProfileManager(employeesReviewsTeams, selectedId)
    setTotalEmployees(manager.totalEmployees)
    setTotalEmployeesCargados(manager.totalRatedCount)
    setProfileEmployeesByTeams(manager.result)

    const approved = calculateProfileApproved(employeesReviewsTeams, selectedId)
    //setTotalEmployees(approved.totalEmployees)
    setMissingApproved(approved.totalEmployees)
    setTotalEmployeesCargadosApproved(approved.totalRatedCount)
    setTotalApprovedByTeams(approved.result)

  }

  const calculateProfileManager = (reviewsTeamsResponse: any, selectedId: number) => {
    
    const rtData = Array.isArray(reviewsTeamsResponse?.data)
      ? reviewsTeamsResponse.data
      : [];
   
    const result = rtData.reduce((acc, item) => {
      const { teams_id, price, reviews_id } = item;

      if (reviews_id != selectedId || !teamsIds.includes(Number(teams_id))) {
        return acc;
      }

      if (!acc[teams_id]) {
        acc[teams_id] = 0;
      }

      if (price && price !== 0) {
        acc[teams_id]++;
      }

      return acc;
    }, {});
    
    const teamsIdByReview = [...new Set(
      rtData
        .filter(item =>
          item.reviews_id == selectedId &&
          teamsIds.includes(Number(item.teams_id))
        )
        .map(item => item.teams_id)
    )];
    
    const totalEmployees = teams.data
    .filter(team => teamsIdByReview.includes(team.id))
    .reduce((sum, team) => sum + (team.employees?.length || 0), 0);
   
    // Declarar primero la variable
    let totalRatedCount = 0;
    totalRatedCount = rtData
        .filter(item =>
          item.reviews_id == selectedId &&
          teamsIds.includes(Number(item.teams_id)) &&
          Number(item.price) !== 0
        ).length;
   
    return { totalEmployees, totalRatedCount, result };
  };

  const calculateProfileApproved = (reviewsTeamsResponse: any, selectedId: number) => {
 
    const rtData = Array.isArray(reviewsTeamsResponse?.data)
      ? reviewsTeamsResponse.data
      : [];
   
    const result = rtData.reduce((acc, item) => {
      const { teams_id, status, reviews_id } = item;

      if (reviews_id != selectedId) return acc;
      if (status !== 1) return acc;

      if (!acc[teams_id]) {
        acc[teams_id] = 0;
      }

      acc[teams_id]++;

      return acc;
    }, {});
    
    // contar cantidad para approved por status?
    const totalEmployees = rtData.reduce((acc, item) => {
      const { teams_id, price, reviews_id } = item;

      if (reviews_id != selectedId || !teamsIds.includes(Number(teams_id))) {
        return acc;
      }

      if (!acc[teams_id]) {
        acc[teams_id] = 0;
      }

      if (price && price !== 0) {
        acc[teams_id]++;
      }

      return acc;
    }, {});

 
    // Declarar primero la variable
    let totalRatedCount = 0;
    totalRatedCount = rtData
          .filter(item =>
            item.reviews_id == selectedId &&
            teamsIds.includes(Number(item.teams_id)) &&
            Number(item.status) == 1
          ).length;
      
   
    return { totalEmployees, totalRatedCount, result };
  };

  // useEffect(() => {
  //   if (session?.user.token) {
  //     userData();
  //   }
  // }, [session?.user.token]);

  useEffect(() => {
      if (lastReviewId) {
        userData(lastReviewId); 
      }
  }, [lastReviewId, session?.user?.token]);

  useEffect(() => {
    if (teams && teamsIds && teams.data) {
      kpiData();
    }
  }, [teams]);

  useEffect(() => {
    // Definimos una función asíncrona dentro del useEffect
    const fetchReviewsAndSetLastId = async () => {
      if (!session?.user?.token) return; // Evitar llamada si no hay token

      try {
        // 1. Obtener todos los reviews
        const reviewsData = await fetchData(session.user.token, 'POST', `reviews_all`);
        
        // 2. Establecer el estado de todos los reviews
        setReviews(reviewsData);

        // 3. Calcular el último review (el de ID más alto)
        if (reviewsData && reviewsData.length > 0) {
          const latestReview = reviewsData.reduce((max, item) => {
            // Asume que item.id es un número o un string comparable
            return item.id > max.id ? item : max;
          }, reviewsData[0]);

          // 4. Establecer los estados del último review
          
          setReview(latestReview);
          setLastReviewId(latestReview.id);
        }
      } catch (error) {
        console.error('Error fetching initial reviews:', error);
      }
    };

    fetchReviewsAndSetLastId();
  }, [session?.user?.token]);

  useEffect(() => {
    if (reviewsTeams && reviewsTeams.data && lastReviewId) {
      const selectedReviewTeam = reviewsTeams.data.find(item => item.reviews_id == lastReviewId);
      setReviewTeam(selectedReviewTeam)
    }
  }, [reviewsTeams, lastReviewId]);

  useEffect(() => {
    if (teams && lastReviewId) {
      const profile = calculateProfileManager(employeesReviewsTeams, lastReviewId)
      setTotalEmployees(profile.totalEmployees)
      setTotalEmployeesCargados(profile.totalRatedCount)
      setProfileEmployeesByTeams(profile.result)

      const approved = calculateProfileApproved(employeesReviewsTeams, lastReviewId)
      setMissingApproved(approved.totalEmployees)
      setTotalEmployeesCargadosApproved(approved.totalRatedCount)
      setTotalApprovedByTeams(approved.result)
  }
  }, [teams]);

  return (
    <div>
      <Breadcrumb />
      <Title>Welcome  {session?.user.email} ! </Title>

      {isApprover || isManager ? <h5>Below you will find all your pending tasks: </h5> : ''}

      <SelectReview reviews={reviews} selectedReview={selectedReview} setSelectedReview={setSelectedReview} handleChange={handleChange} /> 

      {
        (isApprover) && (
          <>
            <div className="row mt-4">
              <Reports presupuesto={totalBudget} teamAsignado={totalTeamAssigned} employeeAsignado={totalEmployeeAssigned} consumido={totalConsumed} /> 
            </div>
            
            <TodoList teamUser={teamUser} selectedReview={selectedReview} />
            <Profile table={table} totalEmployeesByTeams={totalEmployeesByTeams} totalEmployees={totalEmployees} totalEmployeesCargados={totalEmployeesCargadosApproved} name={'Approved profiles'} reviewTeam={reviewTeam} missingApproved={missingApproved} />
          </>
        )
      }

      <div className="row">
        {isAdmin || isManager || isSuper ? 
          <Reports presupuesto={totalBudget} teamAsignado={totalTeamAssigned} employeeAsignado={totalEmployeeAssigned} consumido={totalConsumed} />          
        : ''}    
      </div>

      <div className="row">
        {isAdmin || isManager || isSuper ? 
          <Table table={table} totalTeamAssigned={totalTeamAssigned} totalEmployeeAssigned={totalEmployeeAssigned} totalEmployeesByTeams={totalEmployeesByTeams} totalConsumed={totalConsumed} totalProfileByTeams={totalProfileByTeams} totalApprovedByTeams={totalApprovedByTeams} showCompleteColumn={canViewCompleteColumn} showApproverColumn={canViewApproverColumn} />
        : ''}    
      </div>

      <div className="row">
        { isManager ?
          <Profile table={table} totalEmployeesByTeams={totalEmployeesByTeams} totalEmployees={totalEmployees} totalEmployeesCargados={totalEmployeesCargados} name={'Complete profiles'} reviewTeam={undefined} missingApproved={undefined} />
        : ''}    
      </div>

      <div className="row">
        { isAdmin || isSuper ?
        <>
          <Profile table={table} totalEmployeesByTeams={totalEmployeesByTeams} totalEmployees={totalEmployees} totalEmployeesCargados={totalEmployeesCargados} name={'Complete profiles'} reviewTeam={undefined} missingApproved={undefined} />
          <Profile table={table} totalEmployeesByTeams={totalEmployeesByTeams} totalEmployees={totalEmployees} totalEmployeesCargados={totalEmployeesCargadosApproved} name={'Approved profiles'} reviewTeam={undefined} missingApproved={undefined} />
        </>
        : ''}    
      </div>

    </div>
  );
};

export default Home;

