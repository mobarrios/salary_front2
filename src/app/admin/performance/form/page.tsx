'use client';

import React, { useEffect, useState } from "react"
import { useRouter, } from 'next/navigation'
import { apiRequest } from "@/server/services/core/apiRequest";
import { model, name, headers } from '../model'
import { useFields } from '@/hooks/useFields';
import { useSession } from "next-auth/react";
import FormComponent from "@/components/Core/FormComponent";
import { fetchData } from "@/server/services/core/fetchData";
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts'; 

const FormRatings: React.FC = ({ id, type, onClose }) => {

    const router = useRouter()
    const { data: session } = useSession()
    const [item, setItem] = useState(model)
    const [loading, setLoading] = useState(false)
    const fields = useFields(headers);
    const keys = fields.map(header => header.key);

    useEffect(() => {
        const fetchDataAndUpdateItem = async () => {

            if (type) {
                setLoading(true);
                const jsonData = await fetchData(session?.user.token, 'GET', `${name}/${id}`);
                if (jsonData) {
                    updateItemState(jsonData, keys);
                    setLoading(false);
                }
            }
        };
        fetchDataAndUpdateItem();
    }, [id, session?.user.token, type]);

    const updateItemState = (jsonData: Partial<Model>, properties: Array<keyof Model>) => {
        setItem(prevItem => {
            const updatedItem = { ...prevItem };
            properties.forEach(property => {
                if (jsonData[property] !== undefined) {
                    updatedItem[property] = jsonData[property];
                }
            });
            return updatedItem;
        });
    };

    const handleSubmit = async values => {

        try {
            if (type) {
                await apiRequest(`${name}/edit/${id}`, 'PUT', values)
            } else {
                await apiRequest(`${name}/`, 'POST', values)
            }
            showSuccessAlert("Your work has been saved"); 

            onClose();
            router.refresh()

        } catch (error) {
            showErrorAlert("An error occurred while saving");
            console.error('Error:', error);
        }

    }

    return (
        <div className="row">
            <div className='col-12'>
                {
                    !loading ?
                        <FormComponent
                            initialValues={item}
                            onSubmit={handleSubmit}
                            isEditing={type} // Cambiar a true si se está editando
                            fields={fields}
                        />
                        : <div>cargando...</div>
                }
            </div>
        </div>
    );
};

export default FormRatings;
