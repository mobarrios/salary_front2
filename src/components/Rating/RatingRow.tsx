'use client'
import React from 'react';
import { Field } from 'formik';

const RatingRow = ({ key, option, item, isManager, isValidator, values, setFieldValue }) => {
   
    // send rating checked
    const handleCheckboxChange = async (e) => {
        const isChecked = e.target.checked;
        setFieldValue(`${option.id}-${item.id}-checked`, isChecked);
        //setFieldValue(`${option.id}-${item.id}-status`, 0);
    };

    const toggleLike = (type) => {
        setFieldValue(`${option.id}-${item.id}-status`, type);
    };

    // statuts
    const status = values[`${option.id}-${item.id}-status`];
    let statusText = ''; 
    if (status === 1) {
        statusText = <span className="badge rounded-pill bg-success">aproved</span>; 
    } else if (status === 2) {
        statusText = <span className="badge rounded-pill bg-danger">rejected</span>; 
    } else if (status === 0) {
        statusText = <span className="badge rounded-pill bg-secondary">pending</span>;
    } 

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
                {statusText}

                {isValidator && (
                    <>
                        <a
                            className={`btn btn-light btn-xs m-1 ${values[`${option.id}-${item.id}-checked`] == false ? 'disabled' : ''}`}
                            onClick={(e) => {
                                toggleLike(1);
                            }}
                        >
                            <i className={`bi bi-hand-thumbs-up ${values[`${option.id}-${item.id}-status`] == 1 ? 'text-success' : ''}`}></i>
                        </a>
                        <a
                            className={`btn btn-light btn-xs m-1 ${values[`${option.id}-${item.id}-checked`] == false ? 'disabled' : ''}`}
                            onClick={(e) => {
                                toggleLike(2);
                            }}
                        >
                            <i className={`bi bi-hand-thumbs-down ${values[`${option.id}-${item.id}-status`] == 2 ? 'text-danger' : ''}`}></i>
                        </a>
                    </>
                )}
            </td>
        </tr>
    );
};

export default RatingRow;