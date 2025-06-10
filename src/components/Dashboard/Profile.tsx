import React from 'react';
import { formatDate } from "@/functions/formatDate";

const Profile = ({ totalEmployees, totalEmployeesCargados }) => {

    const cargados = totalEmployeesCargados;
    const total = totalEmployees;
    const porcentaje = (cargados / total) * 100;

    return (

        <div className='col-12 mt-4'>
            <div className="card">
                <div className="card-body">
                <h3 className="card-title text-center">Perfiles cargados</h3>
                <p className="fs-1 text-center text-primary">
                    {cargados} de {total}
                </p>
                <div className="progress">
                    <div
                        className="progress-bar"
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