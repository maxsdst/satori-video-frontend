import { createBrowserRouter } from "react-router-dom";
import AuthenticatedRoutes from "./pages/AuthenticatedRoutes";
import FollowingPage from "./pages/FollowingPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import LatestPage from "./pages/LatestPage";
import Layout from "./pages/Layout";
import LoginPage from "./pages/LoginPage";
import MyVideosPage from "./pages/MyVideosPage";
import PopularPage from "./pages/PopularPage";
import ProfilePage from "./pages/ProfilePage";
import RootErrorBoundary from "./pages/RootErrorBoundary";
import SavedVideosPage from "./pages/SavedVideosPage";
import SearchPage from "./pages/SearchPage";
import SignupPage from "./pages/SignupPage";
import UnauthenticatedRoutes from "./pages/UnauthenticatedRoutes";
import VideoPage from "./pages/VideoPage";

export const routes = [
    {
        path: "/",
        element: <Layout />,
        errorElement: (
            <Layout>
                <RootErrorBoundary />
            </Layout>
        ),
        children: [
            {
                index: true,
                element: <HomePage />,
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
                element: <AuthenticatedRoutes />,
                children: [
                    { path: "following", element: <FollowingPage /> },

                    { path: "saved", element: <SavedVideosPage /> },
                    { path: "history", element: <HistoryPage /> },
                    {
                        path: "my_videos",
                        element: <MyVideosPage tabName="videos" />,
                    },
                    {
                        path: "uploads",
                        element: <MyVideosPage tabName="uploads" />,
                    },
                ],
            },
            {
                element: <UnauthenticatedRoutes />,
                children: [
                    { path: "login", element: <LoginPage /> },
                    { path: "signup", element: <SignupPage /> },
                ],
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
                path: "search",
                element: <SearchPage />,
            },
        ],
    },
];

export const router = createBrowserRouter(routes);
