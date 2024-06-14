'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';

const FormEmployees: React.FC = () => {

    const { data: session, status } = useSession()

    const [formData, setFormData] = useState({});
    const [options, setOptions] = useState();
    const [user, setUser] = useState();
    const { id } = useParams();

    const userData = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.user.token}`
                },
            });
            const jsonData = await response.json();
            setUser(jsonData.data[0])

        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const fetchData = async () => {
        try {
            ///api/v1/roles/all/?skip=0&limit=5
            const response = await fetch(`http://127.0.0.1:8000/api/v1/roles/all/?skip=0&limit=10`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.user.token}`
                },
            });
            const jsonData = await response.json();
            setOptions(jsonData.data)


        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    useEffect(() => {
        if (session?.user.token) {
            userData();
            fetchData();
        }
    }, [id, session?.user.token]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    const handleCheckboxChange = async (e) => {
        setFormData({ users_id: id, roles_id: e })
        const result = await apiRequest(`users_roles/`, 'POST', formData)
        console.log(result)
    }

    return (
        <div className="row">
            <div className='col-12'>
                <h1 className='text-primary'>Edit Data</h1>
            </div>
            <div className='col-12'>

                <div>
                    <p><strong>Username</strong> {user != 'undefined' ? user?.user_name : null}</p>
                </div>

                {options && options.map((option) => (
                    <div key={option.id}>
                        <input
                            type="checkbox"
                            id={option.id}
                            name="roles_id"
                            value={option.id}
                            checked={user && user.roles ? user.roles.some(role => role.id === option.id) : ''}
                            onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                        />
                        <label htmlFor={option.id}>{option.name}</label>
                    </div>
                ))}

            </div>
        </div>

    );
};

export default FormEmployees;