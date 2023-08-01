import AuthBox from "../auth/components/AuthBox";
import MainContentArea from "../components/MainContentArea";

function ForgotPasswordPage() {
    return (
        <MainContentArea isContentCentered={true}>
            <AuthBox mode="forgot_password" />
        </MainContentArea>
    );
}

export default ForgotPasswordPage;
