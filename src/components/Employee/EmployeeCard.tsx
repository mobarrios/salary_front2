export const EmployeeCard = ({ employee, ratings, rangeValues, onRangeChange, commentsValues, setCommentsValues }) => {
    return (
        <div className="mt-1 ">
            <p>
                <a data-bs-toggle="collapse" href={`#employee-${employee.id}`} role="button" aria-expanded="false" aria-controls={`employee-${employee.id}`}>
                    <span className="text-uppercase"># {employee.id} - {employee.name} {employee.last_name}</span>
                </a>
            </p>
            <div className="collapse" id={`employee-${employee.id}`}>
                <div className="card card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Current Base Annual Salary</th>
                                <th>Proposed Total Increase %</th>
                                <th>Proposed Total Increase $</th>
                                <th>Proposed New Base Hourly Rate</th>
                                <th>Proposed New Base Annual Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{employee.actual_external_data.annual_salary ? employee.actual_external_data.annual_salary : 0}</td>
                                <td>$ {rangeValues[employee.id] || 0}</td>
                                <td>$ {rangeValues[employee.id] ? calculateProposedIncrease(rangeValues[employee.id]) : 0}</td>
                                <td>$ 0</td>
                            </tr>
                        </tbody>
                    </table>
                    <table>
                        <tbody>
                            {ratings && ratings.map((option) => (
                                <tr key={option.id}>
                                    <td>
                                        <input
                                            type="range"
                                            min={option.percent_min}
                                            max={option.percent_max}
                                            value={rangeValues[`${option.id}-${employee.id}`] || 0}
                                            onChange={(e) => onRangeChange(e, option.id, employee.id)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={commentsValues[`${option.id}-${employee.id}`] || ''}
                                            onChange={(e) => {
                                                const newCommentsValues = { ...commentsValues };
                                                newCommentsValues[`${option.id}-${employee.id}`] = e.target.value;
                                                setCommentsValues(newCommentsValues);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};