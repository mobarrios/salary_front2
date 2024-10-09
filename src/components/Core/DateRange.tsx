'use client'
import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const DateRange = ({ date, formik }) => {

    const formDate = date.form ? new Date(date.form + 'T00:00:00Z') : new Date();
    const toDate = date.to ? new Date(date.to + 'T00:00:00Z') : new Date();

    const [state, setState] = useState([
        {
            startDate: formDate,
            endDate: toDate,
            key: 'selection'
        }
    ]);

    if (formDate.getHours() !== 0) {
        formDate.setDate(formDate.getDate() + 1);
    }

    if (toDate.getHours() !== 0) {
        toDate.setDate(toDate.getDate() + 1);
    }


    const [isOpen, setIsOpen] = useState(false);

    const toggleDateRangePicker = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (item) => {
        setState([item.selection]);
        formik.setFieldValue('daterange', {
            form: item.selection.startDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
            to: item.selection.endDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
        });
    };

    return (
        <>
            <div style={{ position: 'relative' }}>
                <input
                    type='text'
                    className='form-control'
                    onClick={toggleDateRangePicker}
                    value={`${state[0].startDate ? state[0].startDate.toLocaleDateString() : ''} - ${state[0].endDate ? state[0].endDate.toLocaleDateString() : ''}`} // Muestra las fechas seleccionadas
                    readOnly // Evita que el usuario escriba en el input
                />
                {/* <i class="bi bi-calendar2-x"></i> */}
                <i
                    className={isOpen ? "bi bi-calendar2-x" : "bi bi-calendar"} // Ícono de calendario
                    onClick={toggleDateRangePicker}

                    style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                    }}

                ></i>

            </div>
            <br></br>
            <div className='row'>

                {isOpen && (
                    <DateRangePicker
                        onChange={handleSelect}
                        moveRangeOnFirstSelection={false}
                        ranges={state}
                        direction="horizontal"
                    />
                )}

            </div>
        </>
    );
};

export default DateRange;