import React from 'react';
import { formatDate } from "@/functions/formatDate";

const Profile = ({ table ,totalEmployeesByTeams, totalEmployees, totalEmployeesCargados, name }) => {

    const totalByEmployees = table.reduce((sum, team) => {
        const count = totalEmployeesByTeams[team.team_id] || 0;
        return sum + count;
    }, 0);

    const cargados = totalEmployeesCargados;
    const total = totalByEmployees;
    const porcentaje = (cargados / total) * 100;
    const color = porcentaje === 100 ? 'bg-success' : ''
    const colorText = porcentaje === 100 ? 'text-success' : 'text-primary'
    return (

        <div className='col-12 mt-4'>
            <div className="card">
                <div className="card-body">
                <h3 className="card-title text-center">{name}</h3>
                <p className={`fs-1 text-center ${colorText}`}>
                    {cargados} de {total}
                </p>
                <div className="progress">
                    <div
                        className={`progress-bar ${color}`}
                        role="progressbar"
                        style={{ width: `${porcentaje}%` }}
                        aria-valuenow={porcentaje}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                    {Math.round(porcentaje)}%
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}


export default Profile;