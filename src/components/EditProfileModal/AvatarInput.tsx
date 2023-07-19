import {
    Avatar,
    Flex,
    FormControl,
    FormErrorMessage,
    Icon,
    InputProps,
    Tooltip,
    chakra,
} from "@chakra-ui/react";
import { useState } from "react";
import { AiOutlineCamera } from "react-icons/ai";

interface Props {
    avatar?: string;
    inputProps?: InputProps;
    isInvalid?: boolean;
    errorMessage?: string;
}

function AvatarInput({
    avatar: originalAvatar,
    inputProps,
    isInvalid,
    errorMessage,
}: Props) {
    const [avatar, setAvatar] = useState(originalAvatar);

    return (
        <FormControl isInvalid={isInvalid}>
            <Tooltip label="Upload avatar">
                <Avatar size="2xl" src={avatar}>
                    <Flex
                        as="label"
                        backgroundColor="rgb(0, 0, 0, 0.4)"
                        width="100%"
                        height="100%"
                        borderRadius="inherit"
                        position="absolute"
                        justifyContent="center"
                        alignItems="center"
                        _hover={{ cursor: "pointer" }}
                    >
                        <chakra.input
                            {...inputProps}
                            type="file"
                            display="none"
                            onInput={(e: any) => {
                                if (e.target.files?.length > 0)
                                    setAvatar(
                                        URL.createObjectURL(e.target.files[0])
                                    );
                            }}
                        />
                        <Icon as={AiOutlineCamera} boxSize={12} />
                    </Flex>
                </Avatar>
            </Tooltip>
            {errorMessage && (
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            )}
        </FormControl>
    );
}

export default AvatarInput;
