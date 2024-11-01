import React from 'react';
import DateRange from './DateRange';

const CustomField = ({ field, formik }) => {
    return (
        <div>
            <label htmlFor={field.key} className="form-label mt-2">{field.name}</label>
            {field.type === 'select' ? (
                <select
                    className="form-control mt-2"
                    id={field.key}
                    name={field.key}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values[field.key]}
                >
                    <option value="" label="Select an option" />
                    {field.options && field.options.length > 0 ? (
                        field.options.map((option, index) => (
                            <option key={index} value={option.value}>{option.label}</option>
                        ))
                    ) : (
                        <option value="" disabled>No hay opciones disponibles</option>
                    )}
                </select>
            ) : field.type === 'daterange' ? (
                <DateRange date={formik.values[field.key]} formik={formik} />
            ) : (
                <input
                    type={field.type === 'date' ? 'date' : 'text'}
                    placeholder={field.name}
                    className="form-control mt-2"
                    id={field.key}
                    name={field.key}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values[field.key]}
                />
            )}
            {formik.touched[field.key] && formik.errors[field.key] ? (
                <div className='text-danger'>* {formik.errors[field.key]}</div>
            ) : null}
        </div>
    );
};

export default CustomField;