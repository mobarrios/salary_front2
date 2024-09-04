'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import { fetchData } from '@/server/services/core/fetchData'
import { showSuccessAlert } from '@/hooks/alerts';

const FormRol: React.FC = ({id}) => {

    const { data: session, status } = useSession();
    const [options, setOptions] = useState();
    const [user, setUser] = useState();
    const [userRoles, setUserRoles] = useState();
    const router = useRouter();

    const load = async () => {
        try {
            const rolesData = await fetchData(session?.user.token, 'GET', `roles/all/?skip=0&limit=10`);
            setOptions(rolesData.data)

            const usersData = await fetchData(session?.user.token, 'GET', `users/${id}`);
            setUser(usersData.data[0])

            const userRolesData = await fetchData(session?.user.token, 'GET', `users_roles/all/?skip=0&limit=100`);
            setUserRoles(userRolesData.data)

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

        let usersRolesId = userRoles.find(item =>
            item.users_id == parseInt(id) &&
            item.roles_id == parseInt(roleId)
        );

        if (isChecked) {
            // El checkbox está marcado
            const response = await apiRequest(`users_roles/`, 'POST', { users_id: id, roles_id: roleId })
            showSuccessAlert("Your work has been saved");

        } else {
            // El checkbox está desmarcado
            const response = await fetchData(session?.user.token, 'DELETE', `users_roles/delete/${usersRolesId.id}`);
            showSuccessAlert("Your work has been saved");

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

export default FormRol;