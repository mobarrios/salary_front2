export const name = 'salaries_data'
type Model = {
    //id: number;
    amount: number;
    employees_id: number;

};

export const model: Model = {
    //id: 0,
    amount: 0,
    employees_id: 0

};

export const headers = [
    { name: 'Amount', span: 3, key: 'amount' },
    { name: 'Employees ID', span: 3, key: 'employees_id' },
];

export const fields = [
    'amount', 'employees_id'
];