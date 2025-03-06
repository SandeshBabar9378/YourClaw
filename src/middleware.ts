import type { MiddlewareResponseHandler } from 'astro';

export const onRequest: MiddlewareResponseHandler = async (context, next) => {
    const url = new URL(context.request.url);
    // console.log("Middleware Triggered:", url.pathname);

    const token = context.cookies.get('payload-token')?.value;
    // console.log("Token:", token);

    const protectedRoutes = ['/pets', '/add-pet', '/dog-list', '/profile', '/dogs', '/cats', '/admin-profile', '/adopter-list', '/donor-list', '/donors-pet','/adopters-pet'];
    const adminOnlyRoutes = ['/adopter-list', '/donor-list', '/donors-pet', '/adopters-pet'];

    const isProtectedRoute = protectedRoutes.some((route) =>
        url.pathname.startsWith(route)
    );

    const isAdminOnlyRoute = adminOnlyRoutes.some((route) =>
        url.pathname.startsWith(route) // 🔥 Ye check karega ki "/donors-pet/anything" bhi admin only ho
    );

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

            if (isAdminOnlyRoute) {
                if (userRole !== "Admin") {
                    console.log("Access Denied. Only Admins Allowed. Redirecting to Profile...");
                    return context.redirect('/profile');
                }
            }

            if (url.pathname === "/profile" || url.pathname === "/admin-profile") {
                if (userRole === "Admin") {
                    // Agar Admin already /admin-profile pe hai toh redirect mat kar
                    if (url.pathname !== "/admin-profile") {
                        // console.log("User is Admin. Redirecting to /admin-profile...");
                        return context.redirect("/admin-profile");
                    }
                } else {
                    // Agar Admin nahi hai aur /admin-profile pe hai toh wapas /profile bhej
                    if (url.pathname === "/admin-profile") {
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