import { Navigate, Outlet } from "react-router-dom";
import useOwnProfile from "../hooks/profiles/useOwnProfile";

function AuthenticatedRoutes() {
    const { data: profile, isLoading } = useOwnProfile();

    if (isLoading) return null;
    if (!profile) return <Navigate to="/login" />;

    return <Outlet />;
}

export default AuthenticatedRoutes;
