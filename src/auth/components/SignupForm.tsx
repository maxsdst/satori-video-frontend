import { Button, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Input from "../../forms/Input";
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

    const navigate = useNavigate();

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
                            {
                                onSuccess: () => navigate("/"),
                            }
                        );
                    },
                })
            )}
        >
            <VStack spacing={2}>
                <Input
                    type="text"
                    label="Email"
                    inputProps={register("email")}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                />
                <Input
                    type="text"
                    label="Full name"
                    inputProps={register("full_name")}
                    isInvalid={!!errors.full_name}
                    errorMessage={errors.full_name?.message}
                />
                <Input
                    type="text"
                    label="Username"
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
                <Button
                    isDisabled={signup.isLoading}
                    type="submit"
                    width="100%"
                >
                    Sign up
                </Button>
            </VStack>
        </form>
    );
}

export default SignupForm;
