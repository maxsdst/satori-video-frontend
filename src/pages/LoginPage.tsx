import { Flex } from "@chakra-ui/react";
import AuthBox from "../auth/components/AuthBox";

function LoginPage() {
    return (
        <Flex
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
        >
            <AuthBox mode="login" />
        </Flex>
    );
}

export default LoginPage;
