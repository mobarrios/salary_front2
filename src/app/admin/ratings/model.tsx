export const name = 'ratings';

type Model = {
    name: string;
    percent: number;
   
};

export const model: Model = {
    //id: 0,
    name: "",
    percent:0

};

export const headers = [
    { name: 'Name', span: 3, key: 'name' },
    { name: 'Percent', span: 3, key: 'percent' }
];
