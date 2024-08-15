import {
    Button,
    Divider,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    Popover,
    PopoverAnchor,
    PopoverContent,
    Portal,
    chakra,
    useDisclosure,
} from "@chakra-ui/react";
import { useSize } from "@chakra-ui/react-use-size";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useFirstMountState } from "react-use";
import ResultsPopoverContent from "./ResultsPopoverContent";

function SearchInput() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const locationSearchQuery =
        location.pathname == "/search/" ? searchParams.get("query") || "" : "";

    const [searchQuery, setSearchQuery] = useState(locationSearchQuery);
    const [internalSearchQuery, setInternalSearchQuery] =
        useState(locationSearchQuery);

    const searchQueryTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearchQuery(internalSearchQuery);
        }, 300);

        searchQueryTimeout.current = timeout;

        return () => clearTimeout(timeout);
    }, [internalSearchQuery]);

    const inputRef = useRef<HTMLInputElement>(null);
    const inputSize = useSize(inputRef);

    const {
        isOpen: areResultsOpen,
        onOpen: openResults,
        onClose: closeResults,
    } = useDisclosure();

    const isFirstMount = useFirstMountState();

    useLayoutEffect(() => {
        if (isFirstMount) return;
        if (searchQuery) openResults();
        else closeResults();
    }, [searchQuery]);

    const navigate = useNavigate();

    const borderRadius = 20;
    const submitButtonWidth = "70px";

    return (
        <chakra.form
            aria-label="Search"
            maxWidth="600px"
            onSubmit={(event) => {
                event.preventDefault();
                if (!inputRef.current?.value) return;
                closeResults();
                if (searchQueryTimeout.current)
                    clearTimeout(searchQueryTimeout.current);
                navigate("/search/?query=" + inputRef.current?.value);
            }}
        >
            <Popover
                isOpen={areResultsOpen}
                initialFocusRef={inputRef}
                closeOnBlur={true}
            >
                <PopoverAnchor>
                    <InputGroup onBlur={closeResults}>
                        <Input
                            ref={inputRef}
                            borderRadius={borderRadius}
                            placeholder="Search"
                            variant="filled"
                            defaultValue={locationSearchQuery}
                            onInput={(e) =>
                                setInternalSearchQuery(e.currentTarget.value)
                            }
                            paddingRight={`calc(${submitButtonWidth} + 6px)`}
                        />
                        <InputRightElement width={submitButtonWidth}>
                            <Divider orientation="vertical" />
                            <Button
                                aria-label="Search"
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
                </PopoverAnchor>
                <Portal>
                    <PopoverContent
                        aria-label="Search results"
                        width={{
                            base: "100vw",
                            sm: "100vw",
                            md: inputSize?.width,
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <ResultsPopoverContent
                            searchQuery={searchQuery}
                            onClose={closeResults}
                        />
                    </PopoverContent>
                </Portal>
            </Popover>
        </chakra.form>
    );
}

export default SearchInput;
