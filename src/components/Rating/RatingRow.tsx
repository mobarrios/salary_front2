import React from 'react';
import { Field } from 'formik';

const RatingRow = ({ option, item, isManager, values, setFieldValue }) => {
    const handleCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        setFieldValue(`${option.id}-${item.id}-checked`, isChecked);
    };

    return (
        <tr>
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
                    <label className="form-check-label" htmlFor={option.id}>{option.name}</label>
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