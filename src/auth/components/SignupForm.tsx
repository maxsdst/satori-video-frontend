import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
    email: z.string().email("Enter valid email."),
    full_name: z.string().nonempty("Full name is required."),
    username: z.string().min(3, "Username must be at least 3 characters long."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onSignupSubmit: (data: FieldValues) => void;
}

function SignupForm({ onSignupSubmit }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    return (
        <form onSubmit={handleSubmit(onSignupSubmit)}>
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
            <Button type="submit" width="100%">
                Sign up
            </Button>
        </form>
    );
}

export default SignupForm;
