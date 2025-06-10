'use client';

import React, { useEffect, useState } from "react"
import { formatPrice } from '@/functions/formatDate';

const Reports: React.FC = ({ presupuesto, teamAsignado, employeeAsignado, consumido }) => {

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
        </>
    );
};

export default Reports;
