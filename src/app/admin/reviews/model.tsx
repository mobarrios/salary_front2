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
    { name: 'From', span: 3, key: 'form' },
    { name: 'To', span: 3, key: 'to' },
    { name: 'Status', span: 3, key: 'status' },
    { name: 'Price', span: 3, key: 'price' },
    { name: 'Name', span: 3, key: 'name' },
];
