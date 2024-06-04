import { Box, Button, Divider, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

interface Props {
    mode: "login" | "signup" | "forgot_password";
}

function AuthBox({ mode }: Props) {
    return (
        <Box
            borderWidth={{ sm: 0, md: 1 }}
            width={{ sm: "100%", md: "440px" }}
            borderRadius={6}
            padding={6}
        >
            {mode === "login" && <LoginForm />}
            {mode === "signup" && <SignupForm />}
            <Divider orientation="horizontal" paddingY={2} />
            <HStack justifyContent="start" marginTop={4}>
                {mode !== "login" && (
                    <Button variant="link" colorScheme="blue">
                        <Link to="/login">Log in</Link>
                    </Button>
                )}
                {mode !== "signup" && (
                    <Button variant="link" colorScheme="blue">
                        <Link to="/signup">Sign up</Link>
                    </Button>
                )}
            </HStack>
        </Box>
    );
}

export default AuthBox;
