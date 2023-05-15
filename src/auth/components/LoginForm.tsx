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
    username: z.string().nonempty("Username or email is required."),
    password: z.string().nonempty("Password is required."),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onLoginSubmit: (data: FieldValues) => void;
}

function LoginForm({ onLoginSubmit }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    return (
        <form onSubmit={handleSubmit(onLoginSubmit)}>
            <FormControl marginBottom={2} isInvalid={!!errors.username}>
                <FormLabel>Username or email</FormLabel>
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
                Log in
            </Button>
        </form>
    );
}

export default LoginForm;
