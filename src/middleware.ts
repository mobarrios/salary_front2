import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin", // Página a la que redirigir cuando la sesión no sea válida
  },
});


// export async function middleware(req: NextRequest) {
//     const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//     //const token = await getServerSession(authOptions)
//     //const jwt = token.user.token;

//     if (!session) 
//     {
//         const url = req.nextUrl.clone();
//         url.pathname = '/auth/signin';
//         return NextResponse.redirect(url);
    
//     } else {
        
//             const requestOptions = {
//                 method: 'GET',
//                 headers: {
//                     "Content-type": "application/json",
//                     "Authorization": `Bearer ${session.user.token}`
//                 }
//             };
//            const response = await fetch(process.env.API_SALARY + `/token/validate`, requestOptions);
       
//             if (response.status === 401) {
//                  const url = req.nextUrl.clone();
//                  url.pathname = '/auth/signin';
//                  return NextResponse.redirect(url);
//             }
//         return NextResponse.next();       
//     }
// }

// export async function middleware(req: NextRequest) {
//     // Obtiene la sesión actual del usuario
//     const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

//     if (!session) {
//         // Redirige al usuario a la página de inicio de sesión si no está autenticado
//         const url = req.nextUrl.clone();
//         url.pathname = '/auth/signin';
//         return NextResponse.redirect(url);

//     } else {
//         try {
//             // Opciones para la solicitud al backend
//             const requestOptions = {
//                 method: 'GET',
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${session.accessToken}`, // Token obtenido de Azure
//                 },
//             };

//             // Validar el token con el backend
//             const response = await fetch(`${process.env.API_SALARY}/token/validate`, requestOptions);

//             if (response.status === 401) {
//                 // Si el token no es válido, redirige al inicio de sesión
//                 const url = req.nextUrl.clone();
//                 url.pathname = '/auth/signin';
//                 return NextResponse.redirect(url);
//             }

//             if (!response.ok) {
//                 // Manejo de errores si el backend falla
//                 console.error('Error validando el token en el backend:', await response.text());
//                 const url = req.nextUrl.clone();
//                 url.pathname = '/error';
//                 return NextResponse.redirect(url);
//             }

//             // Si el token es válido, permite continuar
//             return NextResponse.next();

//         } catch (error) {
//             console.error('Error durante la validación del token:', error);
//             // Redirige a una página de error en caso de fallo inesperado
//             const url = req.nextUrl.clone();
//             url.pathname = '/error';
//             return NextResponse.redirect(url);
//         }
//     }
// }


// export async function middleware(req: NextRequest) {
//     const url = req.nextUrl.clone();

//     // Si llega un "code" en la URL (respuesta de Azure AD)
//     if (req.nextUrl.pathname === '/api/auth/callback/azure-ad' && req.nextUrl.searchParams.has('code')) {
//         const code = req.nextUrl.searchParams.get('code') as string;

//         try {
//             // Intercambia el "code" por un token de acceso
//             const tokenResponse = await fetch(process.env.AZURE_AD_TOKEN_ENDPOINT, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//                 body: new URLSearchParams({
//                     client_id: process.env.AZURE_AD_CLIENT_ID as string,
//                     client_secret: process.env.AZURE_AD_CLIENT_SECRET as string,
//                     grant_type: 'authorization_code',
//                     code: code,
//                     redirect_uri: process.env.AZURE_AD_REDIRECT_URI as string,
//                 }),
//             });

//             const tokenData = await tokenResponse.json();

//             if (tokenResponse.ok && tokenData.access_token) {
//                 // Guarda el token en la sesión o cookies según tu preferencia
//                 const session = { user: { token: tokenData.access_token } };

//                 // Aquí puedes redirigir al home si todo está bien
//                 url.pathname = '/';
//                 return NextResponse.redirect(url);
//             } else {
//                 console.error('Error al obtener el token de Azure AD:', tokenData);
//                 url.pathname = '/auth/signin';
//                 return NextResponse.redirect(url);
//             }
//         } catch (error) {
//             console.error('Error en la validación con Azure AD:', error);
//             url.pathname = '/auth/signin';
//             return NextResponse.redirect(url);
//         }
//     }

//     // Validación de sesión existente
//     const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

//     if (!session) {
//         url.pathname = '/auth/signin';
//         return NextResponse.redirect(url);
//     } else {
//         try {
//             // Lógica de validación del token en el backend
//             const requestOptions = {
//                 method: 'GET',
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${session.user.token}`,
//                 },
//             };

//             const response = await fetch(`${process.env.API_SALARY}/token/validate`, requestOptions);

//             if (response.status === 401) {
//                 url.pathname = '/auth/signin';
//                 return NextResponse.redirect(url);
//             }
//         } catch (error) {
//             console.error('Error validando token con backend:', error);
//             url.pathname = '/auth/signin';
//             return NextResponse.redirect(url);
//         }

//         return NextResponse.next();
//     }
// }

export const config = {
    matcher: [
        "/",
        "/calendar/:path*",
        "/analytics/:path*",
        "/admin/:path*",
        "/chart/:path*",
        "/profile/:path*",
        "/tables/:path*",
        "/settings/:path*",
        "/ui/:path*",
    ]
}