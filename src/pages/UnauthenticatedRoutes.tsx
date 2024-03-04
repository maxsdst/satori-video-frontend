import { Navigate, Outlet } from "react-router-dom";
import useOwnProfile from "../hooks/profiles/useOwnProfile";

function UnauthenticatedRoutes() {
    const { data: profile, isLoading } = useOwnProfile();

    if (isLoading) return null;
    if (profile) return <Navigate to="/" />;

    return <Outlet />;
}

export default UnauthenticatedRoutes;
