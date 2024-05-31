import { createBrowserRouter } from "react-router-dom";
import FollowingPage from "./pages/FollowingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import LatestPage from "./pages/LatestPage";
import Layout from "./pages/Layout";
import LoginPage from "./pages/LoginPage";
import MyVideosPage from "./pages/MyVideosPage";
import PopularPage from "./pages/PopularPage";
import ProfilePage from "./pages/ProfilePage";
import SavedVideosPage from "./pages/SavedVideosPage";
import SearchPage from "./pages/SearchPage";
import SignupPage from "./pages/SignupPage";
import UnauthenticatedRoutes from "./pages/UnauthenticatedRoutes";
import VideoPage from "./pages/VideoPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                element: <UnauthenticatedRoutes />,
                children: [
                    { path: "login", element: <LoginPage /> },
                    { path: "signup", element: <SignupPage /> },
                    {
                        path: "forgot_password",
                        element: <ForgotPasswordPage />,
                    },
                ],
            },
            {
                path: "popular",
                element: <PopularPage />,
            },
            {
                path: "latest",
                element: <LatestPage />,
            },
            {
                path: "users/:username",
                element: <ProfilePage />,
            },
            {
                path: "videos/:videoId",
                element: <VideoPage />,
            },
            {
                path: "my_videos",
                element: <MyVideosPage tabName="videos" />,
            },
            {
                path: "uploads",
                element: <MyVideosPage tabName="uploads" />,
            },
            {
                path: "search",
                element: <SearchPage />,
            },
            { path: "saved", element: <SavedVideosPage /> },
            { path: "history", element: <HistoryPage /> },
            { path: "following", element: <FollowingPage /> },
        ],
    },
]);

export default router;
