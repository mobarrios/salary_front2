'use server'
import { authOptions } from '@/server/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export const apiRequest = async (url, method, data) => {
    console.log(url, method, data, process.env.API_SALARY + `/${url}`)
    const session = await getServerSession(authOptions)
    const jwt = session.user.token;

    const requestOptions = {
        method: method,
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${jwt}`
        }
    };

    if (data) {
        requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(process.env.API_SALARY + `/${url}`, requestOptions);
    console.log(response)
    if (response.status === 403) {
        redirect('/admin/dashboard')
    }
    const result = data ? response.json() : response

    return result;
};
