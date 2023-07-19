import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./pages/Layout";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            { path: "login", element: <LoginPage /> },
            {
                path: "users/:username",
                element: <ProfilePage />,
            },
        ],
    },
]);

export default router;
