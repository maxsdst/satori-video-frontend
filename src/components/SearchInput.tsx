import {
    Button,
    ChakraProps,
    Divider,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    chakra,
} from "@chakra-ui/react";
import { useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";

interface Props {
    styles?: ChakraProps;
}

function SearchInput({ styles }: Props) {
    const ref = useRef<HTMLInputElement>(null);

    const borderRadius = 20;

    return (
        <chakra.form
            maxWidth="600px"
            {...styles}
            onSubmit={(event) => {
                event.preventDefault();
                if (ref.current) console.log(ref.current.value);
            }}
        >
            <InputGroup>
                <Input
                    ref={ref}
                    borderRadius={borderRadius}
                    placeholder="Search"
                    variant="filled"
                />
                <InputRightElement width="70px">
                    <Divider orientation="vertical" />
                    <Button
                        type="submit"
                        width="100%"
                        height="100%"
                        background="transparent"
                        borderRadius={`0px ${borderRadius}px ${borderRadius}px 0px`}
                    >
                        <Icon as={AiOutlineSearch} boxSize="24px" />
                    </Button>
                </InputRightElement>
            </InputGroup>
        </chakra.form>
    );
}

export default SearchInput;
