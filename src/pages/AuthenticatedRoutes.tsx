import { Navigate, Outlet, useLocation } from "react-router-dom";
import useOwnProfile from "../hooks/profiles/useOwnProfile";

function AuthenticatedRoutes() {
    const location = useLocation();

    const { data: profile, isFetching } = useOwnProfile();

    if (isFetching) return null;
    if (!profile)
        return <Navigate to="/login" state={{ next: location.pathname }} />;

    return <Outlet />;
}

export default AuthenticatedRoutes;
