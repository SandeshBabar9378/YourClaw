import type { MiddlewareResponseHandler } from 'astro';

export const onRequest: MiddlewareResponseHandler = async (context, next) => {
    const url = new URL(context.request.url);
    // console.log("Middleware Triggered:", url.pathname);
    
    const token = context.cookies.get('payload-token')?.value;
    // console.log("Token:", token);
    
    const protectedRoutes = ['/pets', '/add-pet','/dog-list'];
    const isProtectedRoute = protectedRoutes.some((route) =>
        url.pathname.startsWith(route)
    );
    // console.log("Is Protected Route:", isProtectedRoute);
    
    // Protected route logic
    if (isProtectedRoute) {
        if (!token) {
            console.log("No Token Found. Redirecting...");
            return context.redirect('/try');
        }
        
        try {
            const response = await fetch('https://backend.yourclaw.tech/api/users/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                console.log("Invalid Token. Redirecting...");
                context.cookies.delete('payload-token', { path: '/' });
                return context.redirect('/try');
            }
            const userData = await response.json();
            // console.log("User Verified:", userData);
        } catch (error) {
            console.error("Error verifying token:", error);
            return context.redirect('/try');
        }
    }
    
    // Continue with the request and render the page
    return next();
};