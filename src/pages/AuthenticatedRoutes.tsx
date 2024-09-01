import { Spinner } from "@chakra-ui/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useOwnProfile from "../hooks/profiles/useOwnProfile";

function AuthenticatedRoutes() {
    const location = useLocation();

    const { data: profile, isLoading } = useOwnProfile();

    if (isLoading) return <Spinner role="progressbar" />;
    if (!profile)
        return <Navigate to="/login" state={{ next: location.pathname }} />;

    return <Outlet />;
}

export default AuthenticatedRoutes;
