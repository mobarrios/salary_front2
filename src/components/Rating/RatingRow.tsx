import React from 'react';
import { Field } from 'formik';
import { apiRequest } from '@/server/services/core/apiRequest';
import { fetchData } from '@/server/services/core/fetchData';

const RatingRow = ({ key, option, item, isManager, isValidator, values, setFieldValue, reviews_id, team_id, ratingsTeamEmployees, session }) => {

    // send rating checked
    const handleCheckboxChange = async (e) => {
        const isChecked = e.target.checked;
        setFieldValue(`${option.id}-${item.id}-checked`, isChecked);

        if (!isChecked) {
            let reviewTeamEmployeesId = ratingsTeamEmployees.find(reviewItem =>
                reviewItem.reviews_id == reviews_id &&
                reviewItem.employees_id == item.id &&
                reviewItem.ratings_id == option.id &&
                reviewItem.teams_id == team_id
            );

            console.log(reviews_id, item.id, option.id, team_id)
            console.log(reviewTeamEmployeesId, ratingsTeamEmployees)
            if (reviewTeamEmployeesId) {
                // El checkbox está desmarcado
                const response = await fetchData(session, 'DELETE', `reviews_teams_employees/delete/${reviewTeamEmployeesId.id}`);
                console.log(response);

            } else {
                console.log('No se encontró el elemento para desmarcar');
            }
        }

        /*
        if (isChecked) {

            const postData = {
                reviews_id: reviews_id,
                teams_id: team_id,
                employees_id: item.id,
                ratings_id: option.id,
                status: 1
            };

            const response = await apiRequest(`reviews_teams_employees/`, 'POST', postData);
            console.log(response)
        } else {

            let reviewTeamEmployeesId = ratingsTeamEmployees.find(reviewItem =>
                reviewItem.reviews_id == reviews_id &&
                reviewItem.employees_id == item.id &&
                reviewItem.ratings_id == option.id &&
                reviewItem.teams_id == team_id
            );

            console.log(reviews_id, item.id, option.id, team_id)
            console.log(reviewTeamEmployeesId, ratingsTeamEmployees)
            if (reviewTeamEmployeesId) {
                // El checkbox está desmarcado
                const response = await fetchData(session, 'DELETE', `reviews_teams_employees/delete/${reviewTeamEmployeesId.id}`);
                console.log(response);

            } else {
                console.log('No se encontró el elemento para desmarcar');
            }
        }
        */

    };

    return (
        <tr key={key}>
            <td style={{ width: '150px' }}>
                <div className="form-check form-switch">
                    {isManager && (
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={option.id}
                            name={`${option.id}-${item.id}-checked`}
                            checked={values[`${option.id}-${item.id}-checked`]} // Bind the checked state
                            onChange={handleCheckboxChange} // Handle the change event
                        />
                    )}
                    <label className="form-check-label" htmlFor={option.id}>{option.name} - {option.id}</label>
                </div>
            </td>
            <td style={{ width: '100px' }}>
                <small className="margin-bottom">{option.percent_min} %</small>
                <Field
                    disabled={!values[`${option.id}-${item.id}-checked`]} // Enable/disable based on checkbox
                    type='number'
                    step={1}
                    min={option.percent_min}
                    max={option.percent_max}
                    name={`${option.id}-${item.id}-percent`}
                />
                <small className="margin-top">{option.percent_max} %</small>
            </td>
            <td style={{ width: '150px' }}>
                <Field
                    disabled={!values[`${option.id}-${item.id}-checked`]} // Enable/disable based on checkbox
                    type="text"
                    name={`${option.id}-${item.id}-comments`}
                    placeholder="Comments"
                />
            </td>
        </tr>
    );
};


export default RatingRow;