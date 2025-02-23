import type { MiddlewareResponseHandler } from 'astro';

export const onRequest: MiddlewareResponseHandler = async (context, next) => {
    const url = new URL(context.request.url);
    // console.log("Middleware Triggered:", url.pathname);

    const token = context.cookies.get('payload-token')?.value;
    // console.log("Token:", token);

    const protectedRoutes = ['/pets', '/add-pet', '/dog-list', '/profile', '/practice-page'];
    const isProtectedRoute = protectedRoutes.some((route) =>
        url.pathname.startsWith(route)
    );
    // console.log("Is Protected Route:", isProtectedRoute);

    // Protected route logic
    if (isProtectedRoute) {
        if (!token) {
            console.log("No Token Found.\nYou are not a LoggedIn\n\nRedirecting...");
            return context.redirect('/login');
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
                return context.redirect('/login');
            }
            const userData = await response.json();
            const userRole = userData?.user.role;
            // console.log("User Role:", userRole);
            if (url.pathname === "/profile" || url.pathname === "/practice-page") {
                if (userRole === "Admin") {
                    // Agar Admin already /practice-page pe hai toh redirect mat kar
                    if (url.pathname !== "/practice-page") {
                        // console.log("User is Admin. Redirecting to /practice-page...");
                        return context.redirect("/practice-page");
                    }
                } else {
                    // Agar Admin nahi hai aur /practice-page pe hai toh wapas /profile bhej
                    if (url.pathname === "/practice-page") {
                        // console.log("User is not an Admin. Redirecting to /profile...");
                        return context.redirect("/profile");
                    }
                }
            }

        } catch (error) {
            console.error("Error verifying token:", error);
            return context.redirect('/login');
        }
    }

    // Continue with the request and render the page
    return next();
};