import AuthBox from "../auth/components/AuthBox";
import MainContentArea from "../components/MainContentArea";

function SignupPage() {
    return (
        <MainContentArea isContentCentered={true}>
            <AuthBox mode="signup" />
        </MainContentArea>
    );
}

export default SignupPage;
