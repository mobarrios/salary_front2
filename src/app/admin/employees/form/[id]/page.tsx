'use client';

import { useParams } from 'next/navigation';
import { useRouter, } from 'next/navigation'
import React, { useState, useEffect } from "react";
import FormComponent from "@/components/Core/FormComponent";
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import { model, headers, name, Model } from '../../model';
import {fetchData} from '@/server/services/core/fetchData'

const FormEmployees: React.FC = () => {

    const { data: session } = useSession()

    const [loading, setLoading] = useState(true)
    const [item, setItem] = useState(model)
    const router = useRouter()
    const { id } = useParams();
    
    const updateItemState = (jsonData: Model) => {
        setItem(prevItem => ({
            ...prevItem,
            name: jsonData?.name,
            last_name: jsonData?.last_name,
            associate_id: jsonData?.associate_id
        }));
    };

    useEffect(() => {
        if (session?.user.token) {
            const fetchDataAndUpdateItem = async () => {
                const jsonData = await fetchData(session?.user.token, 'GET', `${name}/${id}`);

                if (jsonData) {
                    updateItemState(jsonData);
                    setLoading(false);
                }
            };

            fetchDataAndUpdateItem();
        }
    }, [id, session?.user.token]);


    const handleSubmit = async (values) => {
        try {
            // Lógica para enviar los datos del formulario
            await apiRequest(`${name}/edit/${id}`, 'PUT', values)

            // Redirigir al usuario después de que se haya completado la solicitud
            router.push(`/admin/${name}`);
            router.refresh()

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fields = headers.map(header => header.key);

    return (
        <div className="row">
            <div className='col-12'>
                <h1 className='text-primary'>Edit Data</h1>
            </div>
            <div className='col-12'>
                {!item ? null :
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
        </div>

    );
};

export default FormEmployees;