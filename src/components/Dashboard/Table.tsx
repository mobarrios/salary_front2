import React from 'react';
import { formatPrice } from '@/functions/formatDate';

const Table = ({ annualMerit, table, totalTeamAssigned, totalEmployeeAssigned, totalEmployeesByTeams, totalConsumed, totalProfileByTeams, totalApprovedByTeams, showCompleteColumn, showApproverColumn}) => {

const totalByEmployees = table.reduce((sum, team) => {
  const count = totalEmployeesByTeams[team.team_id] || 0;
  return sum + count;
}, 0);

const totalComplete = Object.values(totalProfileByTeams).reduce((sum, value) => sum + value, 0);
const totalApproved = Object.values(totalApprovedByTeams).reduce((sum, value) => sum + value, 0);

const totalByconsumed = table.reduce((sum, team) => {
    
    const count = annualMerit[team.team_id] || 0;
    return sum + count;
}, 0);

return (
    <div className='col-12 mt-4'>
        <div className="card">
            <div className="card-body">
                <table className="table">
                    <thead className="table-light">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Teams</th>
                            <th scope="col">Employees</th>
                            {showCompleteColumn && <th scope="col">Complete</th>}
                            {showApproverColumn && <th scope="col">Approved</th>}
                            <th scope="col">Assigned to teams</th>
                            <th scope="col">Assigned to employees</th>
                            <th scope="col">Annual Merit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row"></th>
                            <td>Total</td>
                            <td>{totalByEmployees}</td>
                            {showCompleteColumn && <td>{totalComplete}</td>}
                            {showApproverColumn && <td>{totalApproved}</td>}
                            <td>$ { formatPrice(totalTeamAssigned) }</td>
                            <td>$ { formatPrice(totalEmployeeAssigned) }</td>
                            <td> {((totalEmployeeAssigned / totalByconsumed) * 100).toFixed(2)} %</td>
                        </tr>
                        {table.map((team, index) => (
                            <tr key={index}>
                                <th scope="row">{index + 1}</th>
                                <td>{team.team_name}</td>
                                <td>{totalEmployeesByTeams[team.team_id] }</td>
                                {showCompleteColumn && <td>{totalProfileByTeams[team.team_id]}</td>}
                                {showApproverColumn && <td>{totalApprovedByTeams[team.team_id] }</td>}
                                <td>$ { formatPrice(team.team_assigned_price) }</td>
                                <td>$ { formatPrice(team.total_employee_assigned_price) }</td>
                                <td>
                                    {team.total_employee_assigned_price > 0
                                    ? `${(( team.total_employee_assigned_price / annualMerit[team.team_id] ) * 100).toFixed(2)} `
                                    : '0 '}
                                    %
                                </td>
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