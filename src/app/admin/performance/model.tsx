export const name = 'ratings';

export type Model = {
    name: string;
    percent_min: number;
    percent_max: number;
};

export const model: Model = {
    //id: 0,
    name: "",
    percent_min: 0,
    percent_max: 0
};

export const headers = [
    { name: 'Performance', span: 3, key: 'name' },
    { name: 'Min Percent', span: 3, key: 'percent_min' },
    { name: 'Max Percent', span: 3, key: 'percent_max' }
];

export const buttonExtra = [
    {
        type: 'modal',
        name: 'edit',
        roles: []
    }
]