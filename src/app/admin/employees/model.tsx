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
    { name: 'Name', span: 3, key: 'name' },
    { name: 'Last Name', span: 2, key: 'last_name' },
    { name: 'Associate ID', span: 1, key: 'associate_id' }
];


export const buttonExtra = [
    {
        url: 'admin/employees/teams',
        name: 'teams'
    },
    {
        url :'admin/employees/external_data',
        name : 'Extra Data'
    }
]