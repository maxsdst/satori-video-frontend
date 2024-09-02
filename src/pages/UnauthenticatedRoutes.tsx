import { Spinner } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router-dom";
import useOwnProfile from "../hooks/profiles/useOwnProfile";

function UnauthenticatedRoutes() {
    const { data: profile, isLoading } = useOwnProfile();

    if (isLoading) return <Spinner role="progressbar" />;
    if (profile) return <Navigate to="/" />;

    return <Outlet />;
}

export default UnauthenticatedRoutes;
