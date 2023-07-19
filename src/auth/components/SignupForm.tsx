import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useLogin from "../hooks/useLogin";
import useSignup from "../hooks/useSignup";

const schema = z.object({
    email: z.string().email("Enter valid email."),
    full_name: z.string().nonempty("Full name is required."),
    username: z.string().min(3, "Username must be at least 3 characters long."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
});

type FormData = z.infer<typeof schema>;

function SignupForm() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const signup = useSignup({
        onError: (data) => {
            if (data.email)
                setError("email", { message: data.email.join(" ") });
            if (data.full_name)
                setError("full_name", { message: data.full_name.join(" ") });
            if (data.username)
                setError("username", { message: data.username.join(" ") });
            if (data.password)
                setError("password", { message: data.password.join(" ") });
        },
    });

    const login = useLogin();

    return (
        <form
            onSubmit={handleSubmit((data) =>
                signup.mutate(data, {
                    onSuccess: () => {
                        login.mutate(
                            {
                                username: data.username,
                                password: data.password,
                            },
                            { onSuccess: () => window.location.replace("/") }
                        );
                    },
                })
            )}
        >
            <FormControl marginBottom={2} isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input {...register("email")} type="text" />
                {errors.email && (
                    <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                )}
            </FormControl>
            <FormControl marginBottom={2} isInvalid={!!errors.full_name}>
                <FormLabel>Full name</FormLabel>
                <Input {...register("full_name")} type="text" />
                {errors.full_name && (
                    <FormErrorMessage>
                        {errors.full_name.message}
                    </FormErrorMessage>
                )}
            </FormControl>
            <FormControl marginBottom={2} isInvalid={!!errors.username}>
                <FormLabel>Username</FormLabel>
                <Input {...register("username")} type="text" />
                {errors.username && (
                    <FormErrorMessage>
                        {errors.username.message}
                    </FormErrorMessage>
                )}
            </FormControl>
            <FormControl marginBottom={2} isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input {...register("password")} type="password" />
                {errors.password && (
                    <FormErrorMessage>
                        {errors.password.message}
                    </FormErrorMessage>
                )}
            </FormControl>
            <Button isDisabled={signup.isLoading} type="submit" width="100%">
                Sign up
            </Button>
        </form>
    );
}

export default SignupForm;
