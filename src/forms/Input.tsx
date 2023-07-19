import {
    Input as ChakraInput,
    FormControl,
    FormErrorMessage,
    FormLabel,
    InputProps,
} from "@chakra-ui/react";
import { HTMLInputTypeAttribute } from "react";

interface Props {
    type: HTMLInputTypeAttribute;
    label: string;
    inputProps?: InputProps;
    isInvalid?: boolean;
    errorMessage?: string;
}

function Input({ type, label, inputProps, isInvalid, errorMessage }: Props) {
    return (
        <FormControl isInvalid={isInvalid}>
            <FormLabel>{label}</FormLabel>
            <ChakraInput type={type} {...inputProps} />
            {errorMessage && (
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            )}
        </FormControl>
    );
}

export default Input;
