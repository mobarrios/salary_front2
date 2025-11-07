'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import { fetchData } from '@/server/services/core/fetchData';
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';

const FormEmployeesTeams: React.FC = ({id}) => {
    
    const { data: session, status } = useSession();
    const router = useRouter();

    const [options, setOptions] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [userTeams, setUserTeams] = useState<any | null>(null);

    // Convertimos el ID de string a number (o lo dejamos como string si el parseo falla)
    const numericId = id ? parseInt(id, 10) : undefined;
    
    // Si el ID no se pudo parsear, salimos de la carga
    if (isNaN(numericId as number)) return <p>Error: ID de empleado no válido.</p>;

    // --------------------------------------------------
    // 3. ENCAPSULAR LÓGICA DE CARGA EN useCallback
    // --------------------------------------------------
    const userData = useCallback(async () => {
        // Usamos numericId directamente, ya que lo verificamos
        const currentNumericId = numericId as number;

        try {
            const jsonData = await fetchData(session?.user.token, 'GET', `teams_employees/all/?skip=0&limit=1000`);
            const all = Array.isArray(jsonData?.data) ? jsonData.data : [];
            console.log(all)
            // Usamos currentNumericId
            const rowsForEmployee = all.filter((item: any) => item.employees_id === currentNumericId);

            if (rowsForEmployee.length === 0) {
                setUserTeams(null);
                return;
            }

            // ... (Lógica de ordenamiento y selección del último)
            const sorted = [...rowsForEmployee].sort((a, b) => {
                const aKey = a?.created_at ? new Date(a.created_at).getTime() : (a?.id ?? 0);
                const bKey = b?.created_at ? new Date(b.created_at).getTime() : (b?.id ?? 0);
                return aKey - bKey; // orden ascendente
            });

            const last = sorted[sorted.length - 1];
            setUserTeams(last); 
        } catch (error) {
            console.error('Error fetching teams_employees:', error);
            showErrorAlert('No se pudo obtener la afiliación del empleado.');
        }
    }, [numericId, session?.user.token]); // Dependencias

    const loadOptions = useCallback(async () => {
        try {
            setLoading(true);
            const jsonData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=100`);
            setOptions(Array.isArray(jsonData?.data) ? jsonData.data : []);
        } catch (error) {
            console.error('Error fetching teams:', error);
            showErrorAlert('No se pudieron cargar los equipos.');
        } finally {
            setLoading(false);
        }
    }, [session?.user.token]); // Dependencias

    useEffect(() => {
        // Usamos numericId para verificar que el ID es válido
        if (session?.user.token && numericId !== undefined && !isNaN(numericId)) {
            userData();
            loadOptions();
        }
    }, [numericId, session?.user.token, userData, loadOptions]); // Agregamos userData y loadOptions a las dependencias

    if (status === 'loading') return <p>Loading...</p>;
    
    // Si el ID no es válido, mostramos un error más claro
    if (numericId === undefined || isNaN(numericId)) return <p>Error: Falta o es incorrecto el ID del empleado en la URL.</p>;


    const handleRadioChange = async (teamId: number) => {
        try {
            // Usamos numericId
            await apiRequest(`teams_employees/`, 'POST', { employees_id: numericId, teams_id: teamId });
            showSuccessAlert("Your work has been saved");

            // Re-consulta: Llama a la función memoizada
            await userData();
            router.refresh();
        } catch (error) {
            console.error('Error creating teams_employees:', error);
            showErrorAlert("Error creating teams_employees");
        }
    };

    // ... (El return se mantiene igual)
    return (
        <div className="row m-2">
            <div className="col-12">
                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    options && options.map((option: any) => {
                        const checked = userTeams?.teams_id === option.id;
                        const inputId = `team_${option.id}`;
                        return (
                            <div className="row form-check mt-2" key={option.id}>
                                <div className="col-2">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="teamSelection"
                                        id={inputId}
                                        value={option.id}
                                        checked={!!checked}
                                        onChange={() => handleRadioChange(option.id)}
                                    />
                                </div>
                                <div className="col-10 ms-3">
                                    <label className="form-check-label" htmlFor={inputId}>
                                        {option.name}
                                    </label>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FormEmployeesTeams;