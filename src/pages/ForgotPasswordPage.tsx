import { Flex } from "@chakra-ui/react";
import AuthBox from "../auth/components/AuthBox";

function ForgotPasswordPage() {
    return (
        <Flex
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
        >
            <AuthBox mode="forgot_password" />
        </Flex>
    );
}

export default ForgotPasswordPage;
