import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomField from './CustomField';

const FormComponent = ({ initialValues, onSubmit, isEditing, fields }) => {

    const handleFormSubmit = async (values, onSubmit) => {
        try {
            //const confirmed = await confirmSave();

            // if (confirmed) {
            onSubmit(values);
            //     Swal.fire({
            //         title: "Save!",
            //         icon: "success"
            //     });
            // }
        } catch (error) {
            console.log("error ===> ", error);
        }
    };

    // Crear un objeto con las reglas de validación para cada campo
    const validationRules = fields.reduce((rules, field) => {
        if (field.key === 'email') {
            rules[field.key] = Yup.string()
                .email('invalid email format')
                .required('required');
        } else if (field.key === 'percent_min' || field.key === 'percent_max') {
            rules[field.key] = Yup.number()
                .required('required')
                .min(Yup.ref('percent_min'), 'percent_max debe ser mayor o igual que percent_min');
        } else if (field.key === 'form' || field.key === 'to' ) {
            rules[field.key] = Yup.date()
                .required('required')
                .nullable()
                .typeError('Debe ser una fecha válida')
                //.min(new Date(), 'La fecha debe ser hoy o en el futuro'); // Fecha mínima: hoy
        }
        else {
            rules[field.key] = Yup.string().required('required');
        }
        return rules;
    }, {});

    // Definir el esquema de validación con los campos y reglas
    const validationSchema = Yup.object().shape(validationRules);

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: async values => {
            handleFormSubmit(values, onSubmit);
        },
    });

    return (
        <div className="row ">
            <div className="col-12">
                <div className="bg-white ">

                    <form onSubmit={formik.handleSubmit}>
                        {fields.map((field, key) => (
                            <CustomField key={key} field={field} formik={formik} />
                        ))}
                        <button
                            type="submit"
                            className="btn btn-primary mt-3">
                            {isEditing ? 'Edit' : 'Save'}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default FormComponent;