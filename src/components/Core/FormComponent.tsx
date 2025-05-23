import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomField from './CustomField';

const FormComponent = ({ initialValues, onSubmit, isEditing, fields }) => {

    const handleFormSubmit = async (values, onSubmit) => {
        try {
            onSubmit(values);
        } catch (error) {
            console.log("error ===> ", error);
        }
    };

    // Crear un objeto con las reglas de validación para cada campo
    const validationRules = fields.reduce((rules, field) => {
        if (field.key === 'email') {
            rules[field.key] = Yup.string()
                .email('invalid format')
                .required('Required');
        } else if (field.key === 'percent_min' || field.key === 'percent_max') {
            rules[field.key] = Yup.number()
                .required('Required')
                .min(Yup.ref('percent_min'), 'percent_max > percent_min');
        } else if (field.key === 'daterange') {
            rules[field.key] = Yup.object().shape({
                form: Yup.date()
                    .required('required')
                    .typeError('invalid format'),
                to: Yup.date()
                    .required('required')
                    .typeError('invalid format')
            });
        }
        /*
        else if (field.key === 'from') {
            rules[field.key] = Yup.date()
                .required('Requerido')
                .nullable()
                .typeError('Debe ser una fecha válida');
        }
        else if (field.key === 'to') {
            rules[field.key] = Yup.date()
                .required('Requerido')
                .nullable()
                .typeError('Debe ser una fecha válida')
                .test('is-greater', 'La fecha "to" debe ser mayor que "from"', function(value) {
                    //const { from } = this.parent; // Accede al valor de "from"
                    const from = this.resolve(Yup.ref('from')); // Usa this.resolve para obtener el valor de "from"

                    return validateDateRange(from, value); // Llama a tu función de validación
                });
        }
        */
        else {
            rules[field.key] = Yup.string().required('Required');
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
                            Save
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default FormComponent;