import React from 'react';
import { formatPrice } from '@/functions/formatDate';

const Table = ({ table, totalTeamAssigned, totalEmployeeAssigned, totalEmployeesByTeams, totalConsumed}) => {

const totalByEmployees = table.reduce((sum, team) => {
  const count = totalEmployeesByTeams[team.team_id] || 0;
  return sum + count;
}, 0);

return (
    <div className='col-12 mt-4'>
        <div className="card">
            <div className="card-body">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Teams</th>
                            <th scope="col">Employees</th>
                            <th scope="col">Assigned to teams</th>
                            <th scope="col">Assigned to employees</th>
                            <th scope="col">Consumed</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row"></th>
                            <td>Total</td>
                            <td>{totalByEmployees}</td>
                            <td>$ { formatPrice(totalTeamAssigned) }</td>
                            <td>$ { formatPrice(totalEmployeeAssigned) }</td>
                            <td>{totalConsumed} %</td>
                        </tr>
                        {table.map((team, index) => (
                            <tr key={index}>
                                <th scope="row">{index + 1}</th>
                                <td>{team.team_name}</td>
                                <td>{totalEmployeesByTeams[team.team_id] }</td>
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