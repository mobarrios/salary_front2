export const name = 'reviews';

type Model = {
    form: string;
    to: string;
    status: number;
    name: string;
    price: number;

};

export const model: Model = {
    //id: 0,
    form: "",
    to: "",
    status: 0,
    name: "",
    price: 0,

};

export const headers = [
    { name: 'From', key: 'form', type: 'date' },
    { name: 'To', key: 'to', type: 'date' },
    { name: 'Status', key: 'status', type:'select',  options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] }, // Opciones con valores
    { name: 'Price', key: 'price' },
    { name: 'Name', key: 'name' },
];

export const buttonExtra = [
    {
        url: 'admin/reviews/teams',
        name: 'teams'
    }
]
