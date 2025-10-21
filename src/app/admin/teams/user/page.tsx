'use client'
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "@/server/services/core/fetchData";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import { apiRequest } from "@/server/services/core/apiRequest";
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';

interface UserTeam {
  teams_id: number;
  users_id: number;
}

interface User {
  id: number;
  user_name: string;
}

interface SelectOption {
  value: number;
  label: string;
}

interface Props {
  id: string;
}

const UserTeams: React.FC<Props> = ({ id }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [usersTeams, setUsersTeams] = useState<UserTeam[]>([]);
    
    const formik = useFormik({
        initialValues: {
            users_teams: [] as number[],
        },
        validationSchema: Yup.object().shape({
            users_teams: Yup.array().required('At least one user must be selected'),
        }),
        onSubmit: async (values) => {
            const currentUserIds = usersTeams.map(userTeam => userTeam.users_id);
            const usersToDelete = currentUserIds.filter(userId => !values.users_teams.includes(userId));
            const usersToAdd = values.users_teams.filter(userId => !currentUserIds.includes(userId));

            const deleteRequests = usersToDelete.map(userId => {
                return fetchData(session?.user.token, 'DELETE', `teams_users/delete/${id}/${userId}`);
            });

            const addRequests = usersToAdd.map(userId => {
                const data = {
                    teams_id: id,
                    users_id: userId
                };
                return apiRequest(`teams_users/`, 'POST', data);
            });

            try {
                await Promise.all([...deleteRequests, ...addRequests]);
                showSuccessAlert("Your work has been saved");
            } catch (error) {
                showErrorAlert("An error occurred while saving");
                console.error('Error al agregar usuario:', error);
            }
        },
    });

    useEffect(() => {
        const fetchDataAndUpdateItem = async () => {
            setLoading(true);
            const jsonData = await fetchData(session?.user.token, 'GET', `users/all/?skip=0&limit=1000`);
            
            const data = jsonData.data as User[];
            const selectOptions = data.map((user: User) => ({
                value: user.id,
                label: user.user_name
            }));
          
            setOptions(selectOptions);

            const usersTeamsResponse = await fetchData(session?.user.token, 'GET', `teams_users/all/?skip=0&limit=1000`);
            const usersTeams = usersTeamsResponse.data.filter((item: UserTeam) => item.teams_id === parseInt(id));
            setUsersTeams(usersTeams);
            const initialUserIds = usersTeams.map((userTeam: UserTeam) => userTeam.users_id);
            formik.setFieldValue('users_teams', initialUserIds);
            setLoading(false);
        };
        fetchDataAndUpdateItem();
    }, [id, session?.user.token]);

    const handleSelectFocus = () => {
        // Lógica para expandir el modal si es necesario
        // Por ejemplo, puedes cambiar el estado que controla el tamaño del modal
        // o aplicar clases CSS para expandir el modal
  
    };

    return (
        <div className="row">
            <div className='col-12'>
                {
                    !loading ?
                        <form onSubmit={formik.handleSubmit}>
                            <Select<SelectOption, true>
                                isMulti
                                options={options}
                                onChange={selectedOptions => {
                                    const selectedIds = selectedOptions?.map(option => option.value) ?? [];
                                    formik.setFieldValue('users_teams', selectedIds); 
                                }}
                                onBlur={formik.handleBlur}
                                onFocus={handleSelectFocus}
                                onMenuOpen={handleSelectFocus}
                                placeholder="Seleccione una o más opciones"
                                value={options.filter((option: SelectOption) => 
                                    formik.values.users_teams.includes(option.value)
                                )}
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                styles={{
                                    menuPortal: base => ({ ...base, zIndex: 9999 })
                                }}

                            />
                            {formik.touched.users_teams && formik.errors.users_teams ? (
                                <div className="text-danger">{formik.errors.users_teams}</div>
                            ) : null}
                            <button
                                type="submit"
                                className="btn btn-primary mt-3">
                                Save
                            </button>
                        </form>
                        : <div>Cargando...</div>
                }
            </div>
        </div>
    );
};

export default UserTeams;