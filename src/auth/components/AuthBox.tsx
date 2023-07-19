import { Box, Button, Divider, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import ForgotPasswordForm from "./ForgotPasswordForm";
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
            {mode === "forgot_password" && (
                <ForgotPasswordForm
                    onForgotPasswordSubmit={(data) => console.log(data)}
                />
            )}
            <Divider orientation="horizontal" paddingY={2} />
            <HStack justifyContent="space-evenly" gap={10} marginTop={4}>
                {mode !== "login" && (
                    <Button variant="link">
                        <Link to="/login">Log in</Link>
                    </Button>
                )}
                {mode !== "signup" && (
                    <Button variant="link">
                        <Link to="/signup">Sign up</Link>
                    </Button>
                )}
                {mode !== "forgot_password" && (
                    <Button variant="link">
                        <Link to="/forgot_password">Forgot password</Link>
                    </Button>
                )}
            </HStack>
        </Box>
    );
}

export default AuthBox;
