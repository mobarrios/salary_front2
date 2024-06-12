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
                {/* <h3 className="text-center mb-4">Form</h3> */}
                <form  onSubmit={formik.handleSubmit}>
                    {/* <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" placeholder="Enter your name" />
                    </div>
                    <div className="mb-3">
                    <label htmlFor="last_name" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="last_name" placeholder="Enter your last name" />
                    </div>
                    <div className="mb-3">
                    <label htmlFor="associate_id" className="form-label">Associate ID</label>
                    <input type="text" className="form-control" id="associate_id" placeholder="Enter your Associate ID" />
                    </div>
                    <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">Submit</button>
                    </div> */}
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

        // <form onSubmit={formik.handleSubmit}>
        //     <div className="grid grid-cols-1">
        //         <div className="flex flex-col gap-9">
        //             <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        //                 <div className="flex flex-col gap-5.5 p-6.5">
                            // {
                            //     fields.map((field, key: number) => (

                            //         <div key={key}>
                            //             <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            //                 {field}
                            //             </label>
                            //             <input
                            //                 type="text"
                            //                 placeholder={field}
                            //                 className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            //                 id={field}
                            //                 name={field}
                            //                 onChange={formik.handleChange}
                            //                 onBlur={formik.handleBlur}
                            //                 value={formik.values[field]}

                            //             />
                            //             {formik.touched[field] && formik.errors[field] ? ( // Cambio de formik.errors.name a formik.errors[field]
                            //                 <div>{formik.errors[field]}</div> // Concatenación del mensaje de error con el nombre del campo
                            //             ) : null}
                            //         </div>
                            //     ))
                            // }
        //                 </div>
        //             </div>
        //         </div>
        //     </div>


            // <button
            //     type="submit"
            //     className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray">
            //     {isEditing ? 'Editar' : 'Guardar'}

            // </button>

        // </form>

    );
};

export default FormComponent;