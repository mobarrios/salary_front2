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
        console.log(values)
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
        rules[field] = Yup.string().required('Required');
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
                        <form  onSubmit={formik.handleSubmit}>
                        
                            {
                                            fields.map((field, key: number) => (

                                                <div key={key}>
                                                    <label htmlFor="name" className="form-label mt-2">{field}</label>

                                                    {/* <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                                        {field}
                                                    </label> */}
                                                    <input
                                                        // type="text"
                                                        placeholder={field}
                                                        className="form-control mt-2"
                                                        id={field}
                                                        name={field}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values[field]}

                                                    />
                                                    {formik.touched[field] && formik.errors[field] ? ( // Cambio de formik.errors.name a formik.errors[field]
                                                        <div>{formik.errors[field]}</div> // Concatenación del mensaje de error con el nombre del campo
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