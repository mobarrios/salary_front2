'use client';

import React, { useState } from "react"
import { useRouter, } from 'next/navigation'
import { apiRequest } from "@/server/services/core/apiRequest";
import { model, name, fields } from '../model'
import FormComponent from "@/components/Core/FormComponent";

const FormEmployees: React.FC = () => {

    const router = useRouter()

    const handleSubmit = async values => {

        try {
            await apiRequest(`${name}/`, 'POST', values)
            router.push(`/admin/${name}`);
            router.refresh()

        } catch (error) {
            // Manejo de errores en caso de que ocurra una excepción
            console.error('Error:', error);
        }

    }


    return (
     
            <div>
                <h1>Employees new</h1>

                <FormComponent
                    initialValues={model}
                    onSubmit={handleSubmit}
                    isEditing={false} // Cambiar a true si se está editando
                    fields={fields}
                />

            </div>
    );
};

export default FormEmployees;