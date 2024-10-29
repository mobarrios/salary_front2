'use client'
import { Title } from "@/components/Title";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/BreadCrumb";
import { apiRequest } from '@/server/services/core/apiRequest';
import { fetchData } from "@/server/services/core/fetchData";
import { formatDate } from "@/functions/formatDate";

const Home = () => {
  const { data: session, status } = useSession()
  const isApprover = session?.user.roles.some(role => role.name === 'approver');
  const [teamUser, setTeamUser] = useState({});

  const userData = async () => {
    try {

      // all teams
      const teamsData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=100`);
      const userIdToFilter = session?.user.id;

      // todos los teams que tienen al usuario logeado
      const teamUserFilter = teamsData.data.filter(grupo =>
        grupo.users.some(user => user.id === userIdToFilter)
      );
      console.log(teamUserFilter)
      const teamIds = teamUserFilter.map(team => team.id);
      console.log(teamIds)
      const reviewTeamsResponse = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=1000`);

      const filteredReviewTeams = reviewTeamsResponse.data
        .filter(reviewTeam =>
          teamIds.includes(Number(reviewTeam.teams_id)) && reviewTeam.status === 2 // Filtrar por teamIds y status
        )
        .map(reviewTeam => {
          const team = teamUserFilter.find(team => team.id === Number(reviewTeam.teams_id));
          return {
            ...reviewTeam,
            teamName: team ? team.name : null // Agregar el nombre del equipo, si existe
          };
        });

      setTeamUser(filteredReviewTeams)

    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (session?.user.token) {
      userData();
    }
  }, [session?.user.token]);
  console.log(teamUser)
  return (
    <div>
      <Breadcrumb />
      <Title>Welcome  {session?.user.name} ! </Title>
      { isApprover ? <h5>Below you will find all your pending tasks: </h5> : '' }
      <div className="row m-2">
        <div className='col-12'>
          {
            isApprover && (
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

    </div>
  );
};

export default Home;


