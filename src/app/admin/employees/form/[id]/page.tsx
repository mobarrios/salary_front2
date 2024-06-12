'use client';

import { useParams } from 'next/navigation';
import { useRouter, } from 'next/navigation'
import React, { useState, useEffect } from "react";
import FormComponent from "@/components/Core/FormComponent";
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import {model, fields, name, Model} from '../../model';

const FormEmployees: React.FC = () => {

    const { data: session, status } = useSession()

    const [loading, setLoading] = useState(true)
    const [formSuccess, setFormSuccess] = useState(false)
    const [formSuccessMessage, setFormSuccessMessage] = useState("")
    const [item, setItem] = useState(model)
    const router = useRouter()
    const { id } = useParams();

    const fetchData = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/${name}/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.user.token}`
                },
            });
            const jsonData = await response.json();
            return jsonData;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const updateItemState = (jsonData: Model) => {
        setItem(prevItem => ({
            ...prevItem,
            name: jsonData?.name,
            last_name: jsonData?.last_name,
            associate_id: jsonData?.associate_id
        }));
    };

    useEffect(() => {
        const fetchDataAndUpdateItem = async () => {
            const jsonData = await fetchData();
            if (jsonData) {
                updateItemState(jsonData);
                setLoading(false);
            }
        };
        fetchDataAndUpdateItem();
    }, [id]);


    const handleSubmit = async (values) => {
        try {
            // Lógica para enviar los datos del formulario
            setFormSuccess(true)

            await apiRequest(`${name}/edit/${id}`, 'PUT', values)
            
            // Redirigir al usuario después de que se haya completado la solicitud
            router.push(`/admin/${name}`);
            router.refresh()

        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (

      
            <div>
                <h1>Employees form # {id}</h1>
                {!item ?
                    <div>{formSuccessMessage}</div>
                    :

                    (!loading ?
                        <FormComponent
                            initialValues={item}
                            onSubmit={handleSubmit}
                            isEditing={true} // Cambiar a true si se está editando
                            fields={fields}
                        />
                        : <div>cargando...</div>
                    )
                }
            </div>
   
    );
};

export default FormEmployees;