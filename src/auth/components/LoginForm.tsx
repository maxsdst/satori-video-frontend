import { Alert, AlertIcon, Button, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Input from "../../forms/Input";
import useLogin from "../hooks/useLogin";

const schema = z.object({
    username: z.string().nonempty("Username or email is required."),
    password: z.string().nonempty("Password is required."),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const login = useLogin();

    return (
        <form
            onSubmit={handleSubmit((data) =>
                login.mutate(data, {
                    onSuccess: () => window.location.replace("/"),
                })
            )}
        >
            <VStack spacing={2}>
                {login.error && (
                    <Alert status="error">
                        <AlertIcon />
                        {login.error.response?.data.detail ||
                            login.error.message}
                    </Alert>
                )}
                <Input
                    type="text"
                    label="Username or email"
                    inputProps={register("username")}
                    isInvalid={!!errors.username}
                    errorMessage={errors.username?.message}
                />
                <Input
                    type="password"
                    label="Password"
                    inputProps={register("password")}
                    isInvalid={!!errors.password}
                    errorMessage={errors.password?.message}
                />
                <Button isDisabled={login.isLoading} type="submit" width="100%">
                    Log in
                </Button>
            </VStack>
        </form>
    );
}

export default LoginForm;
