'use client';
import { redirect } from 'next/navigation'

export const fetchData = async (session,method,url) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_SALARY + `/${url}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session}`
      },
    });

    if (response.status === 403 || response.status === 401 || response.status === 0) {
      redirect('/admin/home'); // Redirige a la página deseada
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

