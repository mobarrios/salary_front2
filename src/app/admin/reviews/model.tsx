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
    { name: 'Name', key: 'name' },
    { name: 'Budget', key: 'price' },
    { name: 'From', key: 'form', type: 'date' },
    { name: 'To', key: 'to', type: 'date' },
    { name: 'Status', key: 'status', type: 'select', options: [{ label: 'Active', value: '1' }, { label: 'Close', value: '0' }] }, // Opciones con valores
];

export const buttonExtra = [
    {
        url: 'admin/reviews/teams',
        name: 'budget',
        roles: ['administrator', 'superuser']
    }
]
