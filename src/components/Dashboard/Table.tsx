import React from 'react';
import { formatPrice } from '@/functions/formatDate';

const Table = ({ table }) => {

return (
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
                        {table.map((team, index) => (
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
    )
}

export default Table;