import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for role-specific cookies
    const adminSession = request.cookies.get('session_admin')?.value;
    const adminRole = request.cookies.get('role_admin')?.value;
    const agentSession = request.cookies.get('session_agent')?.value;
    const agentRole = request.cookies.get('role_agent')?.value;
    const customerSession = request.cookies.get('session_customer')?.value;
    const customerRole = request.cookies.get('role_customer')?.value;

    // Determine which session is active
    let session: string | undefined;
    let role: string | undefined;

    if (adminSession && adminRole) {
        session = adminSession;
        role = adminRole;
    } else if (agentSession && agentRole) {
        session = agentSession;
        role = agentRole;
    } else if (customerSession && customerRole) {
        session = customerSession;
        role = customerRole;
    }

    // Public routes (Login, Register, Seed, etc.)
    if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/seed') || pathname === '/') {
        // If user is already logged in, redirect to their dashboard
        if (session && role) {
            if (role === 'admin' && !pathname.startsWith('/admin')) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            if (role === 'agent' && !pathname.startsWith('/agent')) {
                return NextResponse.redirect(new URL('/agent', request.url));
            }
            if (role === 'customer' && !pathname.startsWith('/shop')) {
                return NextResponse.redirect(new URL('/shop', request.url));
            }
        }

        // If visiting root and not logged in, redirect to login
        if (pathname === '/' && !session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        return NextResponse.next();
    }

    // Protected Routes
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based Access Control
    if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    if (pathname.startsWith('/agent') && role !== 'agent') {
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    // Shop is accessible to customers
    if (pathname.startsWith('/shop') && role !== 'customer') {
        // Optionally allow agents/admins to see shop, but for now enforce role
        // return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/admin/:path*', '/agent/:path*', '/shop/:path*', '/login', '/register'],
};
