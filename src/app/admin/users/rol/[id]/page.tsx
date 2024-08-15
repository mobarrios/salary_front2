'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import { fetchData } from '@/server/services/core/fetchData'

const FormEmployees: React.FC = () => {

    const { data: session, status } = useSession();
    const [options, setOptions] = useState();
    const [user, setUser] = useState();
    const { id } = useParams();
    const router = useRouter();

    const load = async () => {
        try {
            const rolesData = await fetchData(session?.user.token, 'GET', `roles/all/?skip=0&limit=10`);
            setOptions(rolesData.data)

            const usersData = await fetchData(session?.user.token, 'GET', `users/${id}`);
            setUser(usersData.data[0])

        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    useEffect(() => {
        if (session?.user.token) {
            load();
        }

    }, [id, session?.user.token]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    const handleCheckboxChange = async (roleId, isChecked) => {

        const updatedRoles = isChecked
            ? [...user.roles, { id: roleId }]
            : user.roles.filter(role => role.id !== roleId);

        setUser(prevUser => ({ ...prevUser, roles: updatedRoles }));

        if (isChecked) {
            // El checkbox está marcado
            const response = await apiRequest(`users_roles/`, 'POST', { users_id: id, roles_id: roleId })
            console.log(response)
            console.log('El checkbox está marcado');
        } else {
            // El checkbox está desmarcado
            const response = await fetchData(session?.user.token, 'DELETE', `/users_roles/delete/${id}/${roleId}`);
            console.log(response)
            console.log('El checkbox está desmarcado');
        }
        router.refresh();
    };

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
                    <div className="form-check form-switch" key={option.id}>
                        <input
                            className="form-check-input"
                            checked={user && user.roles && user.roles.some(role => role.id === option.id)}
                            type="checkbox"
                            role="switch"
                            name="roles_id"
                            id={option.id}
                            value={option.id}
                            onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{option.name}</label>
                    </div>
                ))}
            </div>
        </div>

    );
};

export default FormEmployees;