export const name = 'items'

type Model = {
    //id: number;
    name: string;
    price: string;

};

export const model: Model = {
    //id: 0,
    name: "",
    price: ""

};

export const headers = [
    { name: 'Name', span: 3, key: 'name' },
    { name: 'Price', span: 3, key: 'price' }
];

export const fields = [
    'name', 'price'
];