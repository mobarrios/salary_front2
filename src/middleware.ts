import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log('middleware', session)
    //const token = await getServerSession(authOptions)
    //const jwt = token.user.token;

    if (!session) {
        const url = req.nextUrl.clone();
        url.pathname = '/auth/signin';
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/calendar/:path*",
        "/dashboard/:path*",
        "/admin/:path*",
        "/chart/:path*",
        "/profile/:path*",
        "/tables/:path*",
        "/settings/:path*",
        "/ui/:path*",
    ]
}