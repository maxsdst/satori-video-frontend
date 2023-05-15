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

export const schema = z.object({
    email: z.string().email("Enter valid email."),
});

export type FormData = z.infer<typeof schema>;

interface Props {
    onForgotPasswordSubmit: (data: FieldValues) => void;
}

function ForgotPasswordForm({ onForgotPasswordSubmit }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    return (
        <form onSubmit={handleSubmit(onForgotPasswordSubmit)}>
            <FormControl marginBottom={2} isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input {...register("email")} type="text" />
                {errors.email && (
                    <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                )}
            </FormControl>
            <Button type="submit" width="100%">
                Reset password
            </Button>
        </form>
    );
}

export default ForgotPasswordForm;
