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
        <FormControl isInvalid={isInvalid}>
            <FormLabel>{label}</FormLabel>
            <ChakraTextarea {...textareaProps} />
            {errorMessage && (
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            )}
        </FormControl>
    );
}

export default Textarea;
