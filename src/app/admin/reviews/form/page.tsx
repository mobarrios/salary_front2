'use client';

import React, { useEffect, useState } from "react"
import { useRouter, } from 'next/navigation'
import { apiRequest } from "@/server/services/core/apiRequest";
import { model, name, headers } from '../model'
import { useFields } from '@/hooks/useFields';
import FormComponent from "@/components/Core/FormComponent";
import { useSession } from "next-auth/react";
import { fetchData } from "@/server/services/core/fetchData";
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';

const FormReview: React.FC = ({ id, type, onClose }) => {

    const router = useRouter()
    const { data: session, status } = useSession()

    const [loading, setLoading] = useState(false)
    const [item, setItem] = useState(model)

    const fields = useFields(headers);

    const keys = fields.map(header => header.key);

    useEffect(() => {
        const fetchDataAndUpdateItem = async () => {

            if (type) {
                setLoading(true);
                const jsonData = await fetchData(session?.user.token, 'GET', `${name}/${id}`);
                if (jsonData) {
                  
                    updateItemState(jsonData);
                    setLoading(false);

                }
            }
        };
        fetchDataAndUpdateItem();
    }, [id, session?.user.token, type]);

    /*
    const updateItemState = (jsonData: any) => {

        const updatedModel = {
            status: jsonData.status || model.status,
            name: jsonData.name || model.name,
            price: jsonData.price || model.price,
            dateRange: {
                form: jsonData.form || model.dateRange.form,
                to: jsonData.to || model.dateRange.to,
            }
        };
        setItem(updatedModel)
        //return updatedModel;
    };
    */

    const updateItemState = (jsonData: Partial<Model>) => {
        setItem(prevItem => {
            const updatedItem = { ...prevItem };
            updatedItem['status'] = jsonData.status
            updatedItem['name'] = jsonData.name
            updatedItem['price'] = jsonData.price
            updatedItem['daterange'].form = jsonData.form
            updatedItem['daterange'].to = jsonData.to

            return updatedItem;
        });
    };
 

    const handleSubmit = async values => {
       
        const valuesData = {
            status: values.status,
            price: values.price,
            name: values.name,
            //form: '2024-09-16',
            //to: '2024-09-20',
            form: values.daterange.form,
            to:values.daterange.to,
        }

        try {
            if (type) {
                await apiRequest(`${name}/edit/${id}`, 'PUT', valuesData)
            } else {
                await apiRequest(`${name}/`, 'POST', valuesData)
            }
            showSuccessAlert("Your work has been saved");
            onClose()
            router.refresh()

        } catch (error) {
            showErrorAlert("An error occurred while saving");
            console.error('Error:', error);
        }

    }

    return (
        <div className="row m-2">
            <div className='col-12'>
                {
                    !loading ?
                        <FormComponent
                            initialValues={item}
                            onSubmit={handleSubmit}
                            isEditing={type} // Cambiar a true si se está editando
                            fields={fields}
                        />
                        : <div>loading...</div>
                }
            </div>
        </div>
    );
};

export default FormReview;