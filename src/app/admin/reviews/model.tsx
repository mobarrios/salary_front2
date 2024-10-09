export const name = 'reviews';

type Model = {
    //form: string;
    //to: string;
    status: number;
    name: string;
    price: number;
    daterange: {
        form: string;
        to: string;
    };

};

export const model: Model = {

    status: 0,
    name: "",
    price: 0,
    daterange: {
        form: "",
        to: "",
    }
};

export const headers = [
    { name: 'Name', key: 'name' },
    { name: 'Budget', key: 'price' },
    //{ name: 'From', key: 'form', type: 'date' },
    //{ name: 'To', key: 'to', type: 'date' },
    { name: 'Status', key: 'status', type: 'select', options: [{ label: 'Active', value: '1' }, { label: 'Closed', value: '0' }] }, // Opciones con valores
    { name: 'Date', key: 'daterange', type: 'daterange' },

];

export const buttonExtra = [
    {
        url: 'admin/reviews/teams',
        name: 'budget',
        roles: ['administrator', 'superuser']
    }
]
