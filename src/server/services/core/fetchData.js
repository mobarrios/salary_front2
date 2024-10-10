'use client';
import { getServerSession } from 'next-auth'

export const fetchData = async (method, url) => {
   const session = await getServerSession(authOptions)
    const jwt = session.user.token;

  try {
    console.log(process.env.NEXT_PUBLIC_SALARY + `/${url}`)
    const response = await fetch(process.env.NEXT_PUBLIC_SALARY + `/${url}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session}`
      },
    });
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

