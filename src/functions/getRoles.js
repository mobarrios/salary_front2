import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';

// Función para obtener los roles de un usuario
export async function getUserRoles() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.roles) {
        return []; // Retorna un array vacío si no hay sesión o roles
    }

    return session.user.roles.map(role => role.name); // Devuelve los nombres de los roles
}

export async function getUserId() {
    const session = await getServerSession(authOptions);
    return session.user.id
}