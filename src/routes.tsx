import { createBrowserRouter } from "react-router-dom";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Layout from "./pages/Layout";
import LoginPage from "./pages/LoginPage";
import MyVideosPage from "./pages/MyVideosPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import UnauthenticatedRoutes from "./pages/UnauthenticatedRoutes";
import VideoPage, { VideoSource } from "./pages/VideoPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <VideoPage videoSource={VideoSource.Recommended} />,
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
                element: <VideoPage videoSource={VideoSource.Popular} />,
            },
            {
                path: "latest",
                element: <VideoPage videoSource={VideoSource.Latest} />,
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
        ],
    },
]);

export default router;
