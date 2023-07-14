import {
    Alert,
    AlertIcon,
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Stack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

    const login = useLogin(() => window.location.replace("/"));

    return (
        <form onSubmit={handleSubmit((data) => login.mutate(data))}>
            <Stack spacing={2}>
                {login.error && (
                    <Alert status="error">
                        <AlertIcon />
                        {login.error.response?.data.detail ||
                            login.error.message}
                    </Alert>
                )}
                <FormControl isInvalid={!!errors.username}>
                    <FormLabel>Username or email</FormLabel>
                    <Input {...register("username")} type="text" />
                    {errors.username && (
                        <FormErrorMessage>
                            {errors.username.message}
                        </FormErrorMessage>
                    )}
                </FormControl>
                <FormControl isInvalid={!!errors.password}>
                    <FormLabel>Password</FormLabel>
                    <Input {...register("password")} type="password" />
                    {errors.password && (
                        <FormErrorMessage>
                            {errors.password.message}
                        </FormErrorMessage>
                    )}
                </FormControl>
                <Button isDisabled={login.isLoading} type="submit" width="100%">
                    Log in
                </Button>
            </Stack>
        </form>
    );
}

export default LoginForm;
