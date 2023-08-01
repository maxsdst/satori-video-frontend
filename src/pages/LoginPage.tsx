import AuthBox from "../auth/components/AuthBox";
import MainContentArea from "../components/MainContentArea";

function LoginPage() {
    return (
        <MainContentArea isContentCentered={true}>
            <AuthBox mode="login" />
        </MainContentArea>
    );
}

export default LoginPage;
