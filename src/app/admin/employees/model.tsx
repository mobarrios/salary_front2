export const name = 'employees';

export type Model = {
    //id: number;
    name: string;
    last_name: string;
    associate_id: number;
};

// se define el modelo del objeto
export const model: Model = {
    //id: 0,
    name: "",
    last_name: "",
    associate_id: 0,


};

// los datos que se van a visualizar en la tabla
export const headers = [
    { name: 'Associate ID', span: 1, key: 'associate_id' },
    { name: 'Name', span: 3, key: 'name' },
    // { name: 'Last name', span: 2, key: "actual_external_data['job_function_description']" },
   
];


export const buttonExtra = [
    {
        type: 'modal',
        name: 'teams',
        roles: []
    },
    {
        url :'admin/employees/external_data',
        name : 'Extra Data',
        roles: []
    }
]