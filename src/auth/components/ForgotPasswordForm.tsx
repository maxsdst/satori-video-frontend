import { Button, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Input from "../../forms/Input";

export const schema = z.object({
    email: z.string().email("Enter valid email."),
});

export type FormData = z.infer<typeof schema>;

function ForgotPasswordForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    return (
        <form onSubmit={handleSubmit(() => {})}>
            <VStack spacing={2}>
                <Input
                    type="text"
                    label="Email"
                    inputProps={register("email")}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                />
                <Button type="submit" width="100%">
                    Reset password
                </Button>
            </VStack>
        </form>
    );
}

export default ForgotPasswordForm;
