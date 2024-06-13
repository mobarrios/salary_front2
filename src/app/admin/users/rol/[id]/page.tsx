
import React from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2'
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { apiRequest } from "@/server/services/core/apiRequest";


export default async function Rol() {

    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    
    const res = await apiRequest(`roles/all/?skip=0&limit=10`, 'GET');

    if (!res?.status) {
        throw new Error('Failed to fetch data');
    }

    const data = await res.json();
    setOptions(data)

    /*
    useEffect(() => {
      // Llamada a la API externa para obtener las opciones del select

      
      fetch('URL_DE_TU_API')
        .then(response => response.json())
        .then(data => setOptions(data))
        .catch(error => console.error(error));
    }, []);
    */

    const handleChange = (e) => {
      setSelectedOption(e.target.value);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {

        } catch (error) {
            // Manejar el error aquí
            console.error('front:', error);
            // Puedes guardar el error en un estado para mostrarlo en la interfaz de usuario
            //setError('Error al autenticar. Por favor, verifica tus credenciales.');
        }
    }

    return (
        <div className="row">
            <div className='col-12'>
                <h1 className='text-primary'>Users Rol</h1>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Roles </label>
                        <select
                            id="select"
                            name="select"
                            value={selectedOption}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="">Select an option</option>
                            {options.map(option => (
                            <option key={option.id} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary mt-3">
                        Save
                    </button>

                </form>

            </div>

        </div>
    )
};