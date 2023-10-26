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
    label?: string;
    inputProps?: InputProps;
    isInvalid?: boolean;
    errorMessage?: string;
    placeholder?: string;
}

function Input({
    type,
    label,
    inputProps,
    isInvalid,
    errorMessage,
    placeholder,
}: Props) {
    return (
        <FormControl isInvalid={isInvalid}>
            {label && <FormLabel>{label}</FormLabel>}
            <ChakraInput
                type={type}
                placeholder={placeholder}
                {...inputProps}
            />
            {errorMessage && (
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            )}
        </FormControl>
    );
}

export default Input;
