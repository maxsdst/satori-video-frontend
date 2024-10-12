import AuthBox from "../auth/components/AuthBox";
import MainContentArea from "../components/MainContentArea";
import useTitle from "../hooks/useTitle";

function LoginPage() {
    useTitle("Login");

    return (
        <MainContentArea isContentCentered={true}>
            <AuthBox mode="login" />
        </MainContentArea>
    );
}

export default LoginPage;
