import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2'

const FormComponent = ({ initialValues, onSubmit, isEditing, fields }) => {

    const confirmSave = async () => {
        const message = await Swal.fire({
            title: "Do you want to save?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes!"
        });
        return message.isConfirmed;
    };

    const handleFormSubmit = async (values, onSubmit) => {
        try {
            const confirmed = await confirmSave();

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
                .email('Formato de correo electrónico inválido')
                .required('Requerido');
        } else {
            rules[field.key] = Yup.string().required('Requerido');
        }
        return rules;
    }, {});

    // Definir el esquema de validación con los campos y reglas
    const validationSchema = Yup.object().shape(validationRules);

    // Configurar useFormik con el esquema de validación
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
                        {
                            fields.map((field, key) => (
                                <div key={key}>
                                    <label htmlFor={field.key} className="form-label mt-2">{field.key}</label>
                                    {field.type === 'select' ? (
                                        <select
                                            className="form-control mt-2"
                                            id={field.key}
                                            name={field.key}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values[field.key]}
                                        >
                                            <option value="" label="Seleccione una opción" />

                                            {field.options && field.options.length > 0 ? (
                                                field.options.map((option, index) => (
                                                    <option key={index} value={option.value}>{option.label}</option> // Usa option.value y option.label
                                                ))
                                            ) : (
                                                <option value="" disabled>No hay opciones disponibles</option>
                                            )}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type === 'date' ? 'date' : 'text'}
                                            placeholder={field.key}
                                            className="form-control mt-2"
                                            id={field.key}
                                            name={field.key}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values[field.key]}
                                        />
                                    )}
                                    {formik.touched[field.key] && formik.errors[field.key] ? (
                                        <div>{formik.errors[field.key]}</div>
                                    ) : null}
                                </div>
                            ))
                        }
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