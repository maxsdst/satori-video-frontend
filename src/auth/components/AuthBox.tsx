import { Box, Button, Divider, HStack } from "@chakra-ui/react";
import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

enum Mode {
    Login,
    Signup,
    ForgotPassword,
}

function AuthBox() {
    const [mode, setMode] = useState(Mode.Login);

    return (
        <Box
            borderWidth={{ sm: 0, md: 1 }}
            width={{ sm: "100%", md: "440px" }}
            borderRadius={6}
            padding={6}
        >
            {mode === Mode.Login && <LoginForm />}
            {mode === Mode.Signup && <SignupForm />}
            {mode === Mode.ForgotPassword && (
                <ForgotPasswordForm
                    onForgotPasswordSubmit={(data) => console.log(data)}
                />
            )}
            <Divider orientation="horizontal" paddingY={2} />
            <HStack justifyContent="space-evenly" gap={10} marginTop={4}>
                {mode !== Mode.Login && (
                    <Button variant="link" onClick={() => setMode(Mode.Login)}>
                        Log in
                    </Button>
                )}
                {mode !== Mode.Signup && (
                    <Button variant="link" onClick={() => setMode(Mode.Signup)}>
                        Sign up
                    </Button>
                )}
                {mode !== Mode.ForgotPassword && (
                    <Button
                        variant="link"
                        onClick={() => setMode(Mode.ForgotPassword)}
                    >
                        Forgot password
                    </Button>
                )}
            </HStack>
        </Box>
    );
}

export default AuthBox;
