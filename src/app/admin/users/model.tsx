export const name = 'users';

type Model = {
    //id: number;
    user_name: string;
    email: string;
    active: number;
    hashed_password: string;
};

export const model: Model = {
    //id: 0,
    user_name: "",
    email: "",
    hashed_password: '',
    active: 0,

};

export const headers = [
    { name: 'Username', span: 3, key: 'user_name' },
    { name: 'Email', span: 2, key: 'email' },
    { name: 'Active', span: 1, key: 'active' }
];

export const fields = [
    'user_name', 'email', 'active'
]