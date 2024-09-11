import React from 'react';
import { Field } from 'formik';
import { apiRequest } from '@/server/services/core/apiRequest';
import { fetchData } from '@/server/services/core/fetchData';

const RatingRow = ({ key, option, item, isManager, isValidator, values, setFieldValue, reviews_id, team_id, ratingsTeamEmployees, session }) => {

    // send rating checked
    const handleCheckboxChange = async (e) => {
        const isChecked = e.target.checked;
        setFieldValue(`${option.id}-${item.id}-checked`, isChecked);
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
            <td className='text-end'>
                    {isValidator && (
                    <>

                    {/* <a className='btn btn-primary btn-xs m-1' onClick={(e) => changeStatusByRatings(e, item.id, 1)}>pending</a> */}

                    <a className='btn btn-light btn-xs m-1' onClick={(e) => changeStatusByRatings(e, item.id, 2)}><i className="text-success bi bi-hand-thumbs-up"></i></a>

                    <a className='btn btn-light btn-xs m-1' onClick={(e) => changeStatusByRatings(e, item.id, 3)}><i className="text-danger bi bi-hand-thumbs-down"></i>
                    </a>

                    </>
                    )}
            </td>
        </tr>
    );
};


export default RatingRow;