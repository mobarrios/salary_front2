'use client';

import React, { useEffect, useState } from "react"
import { formatPrice } from '@/functions/formatDate';

const Reports: React.FC = ({ teams, presupuesto, teamAsignado, employeeAsignado, consumido }) => {
    return (
        <>
            <div className='col-3'>
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title text-center">
                            Total Budget <i className="bi bi-wallet2 text-success ms-2"></i>
                        </h4>
                        <p className="fs-1 text-center text-primary">$ {formatPrice(presupuesto)}</p>
                    </div>
                </div>
            </div>

            <div className='col-3'>
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title text-center">
                            Assigned to teams <i className="bi bi-people-fill text-info ms-2"></i>
                        </h4>
                        <p className="fs-1 text-center text-primary">$ {formatPrice(teamAsignado)}</p>
                    </div>
                </div>
            </div>

            <div className='col-3'>
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title text-center">
                            Assigned to employees <i className="bi bi-person-check-fill text-primary ms-2"></i>
                        </h4>
                        <p className="fs-1 text-center text-primary">$ {formatPrice(employeeAsignado)}</p>
                    </div>
                </div>
            </div>

            <div className='col-3'>
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title text-center">
                            Consumed <i className="bi bi-graph-up-arrow text-danger ms-2"></i>
                        </h4>
                        <p className="fs-1 text-center text-primary">{consumido} %</p>
                    </div>
                </div>
            </div>

            <div className='col-12 mt-4'>
                <div className="card">
                    <div className="card-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Teams</th>
                                    <th scope="col">Budget</th>
                                    <th scope="col">Salary</th>
                                    <th scope="col">Consumed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{team.team_name}</td>
                                        <td>$ { formatPrice(team.team_assigned_price) }</td>
                                        <td>$ { formatPrice(team.total_employee_assigned_price) }</td>
                                        <td>{ team.consumed_percentage } %</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className='col-12 mt-4'>
                <div className="card">
                    <div className="card-body">
                        <h3 className="card-title text-center">Perfiles cargados </h3>
                        <p className="fs-1 text-center text-primary">1000 de 1200</p>

                    </div>
                </div>
            </div>
        </>
    );
};

export default Reports;
