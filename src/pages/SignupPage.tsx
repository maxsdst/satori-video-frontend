import AuthBox from "../auth/components/AuthBox";
import MainContentArea from "../components/MainContentArea";
import useTitle from "../hooks/useTitle";

function SignupPage() {
    useTitle("Sign up");

    return (
        <MainContentArea isContentCentered={true}>
            <AuthBox mode="signup" />
        </MainContentArea>
    );
}

export default SignupPage;
