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

    const validateDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) return true; // Si alguna de las fechas no está presente, la validación pasa
       console.log(startDate, endDate)
        return new Date(startDate) < new Date(endDate); // Validar que startDate sea menor que endDate
    };

    // Crear un objeto con las reglas de validación para cada campo
    const validationRules = fields.reduce((rules, field) => {
        if (field.key === 'email') {
            rules[field.key] = Yup.string()
                .email('Formato de correo electrónico no válido')
                .required('Requerido');
        } else if (field.key === 'percent_min' || field.key === 'percent_max') {
            rules[field.key] = Yup.number()
                .required('Requerido')
                .min(Yup.ref('percent_min'), 'percent_max debe ser mayor o igual que percent_min');
        } else if (field.key === 'from') {
            rules[field.key] = Yup.date()
                .required('Requerido')
                .nullable()
                .typeError('Debe ser una fecha válida');
        } else if (field.key === 'to') {
            rules[field.key] = Yup.date()
                .required('Requerido')
                .nullable()
                .typeError('Debe ser una fecha válida')
                .test('is-greater', 'La fecha "to" debe ser mayor que "from"', function(value) {
                    const { from } = this.parent; // Accede al valor de "from"
                    console.log(from)
                    return validateDateRange(from, value); // Llama a tu función de validación
                });
        } else {
            rules[field.key] = Yup.string().required('Requerido');
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