import {
    Textarea as ChakraTextarea,
    FormControl,
    FormErrorMessage,
    FormLabel,
    TextareaProps,
} from "@chakra-ui/react";

interface Props {
    label: string;
    textareaProps?: TextareaProps;
    isInvalid?: boolean;
    errorMessage?: string;
}

function Textarea({ label, textareaProps, isInvalid, errorMessage }: Props) {
    return (
        <FormControl aria-label={label} isInvalid={isInvalid}>
            <FormLabel>{label}</FormLabel>
            <ChakraTextarea {...textareaProps} />
            {errorMessage && (
                <FormErrorMessage role="alert">{errorMessage}</FormErrorMessage>
            )}
        </FormControl>
    );
}

export default Textarea;
