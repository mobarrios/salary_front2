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
    { name: 'Username', key: 'user_name' },
    { name: 'Email', key: 'email' },
    { name: 'Active', key: 'active', type:'select',  options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] }, // Opciones con valores
    { name: 'Password',key: 'hashed_password' }
];

export const fields = [
    'user_name', 'email', 'active', 'hashed_password'
]

export const buttonExtra = [
    {
        url: 'admin/users/rol',
        name: 'rol'
    }
]