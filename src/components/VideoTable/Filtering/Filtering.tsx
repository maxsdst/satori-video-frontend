import {
    Box,
    Button,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    List,
    ListItem,
    Popover,
    PopoverAnchor,
    PopoverBody,
    PopoverContent,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useReducer, useRef, useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { MdFilterList } from "react-icons/md";
import { Filter } from "../../../services/BaseQuery";
import IconButton from "../../IconButton";
import CharFilterModal from "./CharFilterModal";
import NumberFilterModal from "./NumberFilterModal";
import filteringReducer, { Option } from "./filteringReducer";

interface Props {
    onChange: (appliedFilters: Filter[]) => void;
}

function Filtering({ onChange }: Props) {
    const fieldDisplayNames: Record<string, string> = {
        title: "Title",
        description: "Description",
        views: "Views",
    };

    const options: Option[] = [
        {
            field: "title",
            name: fieldDisplayNames["title"],
            type: "char",
        },
        {
            field: "description",
            name: fieldDisplayNames["description"],
            type: "char",
        },
        {
            field: "views",
            name: fieldDisplayNames["views"],
            type: "number",
        },
    ];

    const [{ availableOptions, appliedFilters }, dispatch] = useReducer(
        filteringReducer,
        {
            options,
            availableOptions: options,
            appliedFilters: [],
        }
    );

    const [input, setInput] = useState("");

    const [selectedOption, setSelectedOption] = useState<Option | null>();

    const filteredOptions = availableOptions.filter(
        (option) =>
            !input ||
            fieldDisplayNames[option.field].toLowerCase().startsWith(input)
    );

    const {
        isOpen: isAutocompleteOpen,
        onOpen: openAutocomplete,
        onClose: closeAutocomplete,
    } = useDisclosure();

    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLElement>(null);

    useEffect(() => {
        function closePopover(e: MouseEvent) {
            if (
                isAutocompleteOpen &&
                e.target !== inputRef.current &&
                !popoverRef.current?.contains(e.target as Node)
            )
                closeAutocomplete();
        }
        document.addEventListener("click", closePopover);
        return () => document.removeEventListener("click", closePopover);
    }, [isAutocompleteOpen, closeAutocomplete]);

    const {
        isOpen: isFilterModalOpen,
        onOpen: openFilterModal,
        onClose: closeFilterModal,
    } = useDisclosure();

    useEffect(() => {
        onChange(appliedFilters);
    }, [appliedFilters]);

    const lookupTypeNames = {
        icontains: "contains",
        lte: "<=",
        gte: ">=",
    };

    const isTitleOptionAvailable = !!availableOptions.find(
        (option) => option.field === "title"
    );

    return (
        <>
            <Popover
                isOpen={isAutocompleteOpen}
                autoFocus={false}
                closeOnBlur={false}
                placement="bottom-start"
            >
                <VStack alignItems="start" width="100%">
                    <PopoverAnchor>
                        <InputGroup>
                            <InputLeftElement>
                                <Icon as={MdFilterList} boxSize={6} />
                            </InputLeftElement>
                            <Input
                                ref={inputRef}
                                placeholder="Filter"
                                variant="filled"
                                width="100%"
                                onFocus={openAutocomplete}
                                onInput={(e) => {
                                    setInput(e.currentTarget.value);
                                    openAutocomplete();
                                }}
                            />
                        </InputGroup>
                    </PopoverAnchor>
                    <HStack flexWrap="wrap">
                        {appliedFilters.map((filter) => (
                            <Box
                                backgroundColor="gray.700"
                                paddingLeft={4}
                                paddingRight={1}
                                paddingY={1}
                                borderRadius="28px"
                            >
                                <HStack spacing={1}>
                                    <Text
                                        fontSize="sm"
                                        maxWidth="200px"
                                        noOfLines={1}
                                        wordBreak="break-all"
                                    >
                                        {fieldDisplayNames[filter.field]}{" "}
                                        {lookupTypeNames[filter.lookupType]}{" "}
                                        {filter.type === "char"
                                            ? `"${filter.value}"`
                                            : filter.value}
                                    </Text>
                                    <IconButton
                                        icon={AiOutlineCloseCircle}
                                        label="Remove"
                                        size="sm"
                                        onClick={() =>
                                            dispatch({
                                                type: "REMOVE_FILTER",
                                                filter,
                                            })
                                        }
                                    />
                                </HStack>
                            </Box>
                        ))}
                    </HStack>
                </VStack>
                <PopoverContent
                    ref={popoverRef}
                    width="fit-content"
                    minWidth="xs"
                    maxWidth="97.5vw"
                >
                    <PopoverBody paddingX={0} paddingY={2}>
                        <List>
                            {input && isTitleOptionAvailable && (
                                <ListItem>
                                    <Button
                                        variant="ghost"
                                        width="100%"
                                        borderRadius="0"
                                        noOfLines={1}
                                        display="inline-block"
                                        textAlign="left"
                                        onClick={() => {
                                            dispatch({
                                                type: "ADD_FILTER",
                                                filter: {
                                                    field: "title",
                                                    type: "char",
                                                    lookupType: "icontains",
                                                    value: input,
                                                },
                                            });
                                            if (inputRef.current)
                                                inputRef.current.value = "";
                                            setInput("");
                                            closeAutocomplete();
                                        }}
                                    >
                                        Title contains "{input}"
                                    </Button>
                                </ListItem>
                            )}
                            {filteredOptions.map((option) => (
                                <ListItem key={option.field}>
                                    <Button
                                        variant="ghost"
                                        width="100%"
                                        borderRadius="0"
                                        justifyContent="left"
                                        onClick={() => {
                                            setSelectedOption(option);
                                            closeAutocomplete();
                                            openFilterModal();
                                        }}
                                    >
                                        {fieldDisplayNames[option.field]}
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                        {!isTitleOptionAvailable &&
                            filteredOptions.length === 0 && (
                                <Text
                                    paddingX={4}
                                    paddingY={2}
                                    textColor="gray.400"
                                >
                                    No matching filter
                                </Text>
                            )}
                    </PopoverBody>
                </PopoverContent>
            </Popover>
            {isFilterModalOpen && selectedOption?.type === "char" && (
                <CharFilterModal
                    option={selectedOption}
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    onApplyFilter={(filter) =>
                        dispatch({ type: "ADD_FILTER", filter })
                    }
                />
            )}
            {isFilterModalOpen && selectedOption?.type === "number" && (
                <NumberFilterModal
                    option={selectedOption}
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    onApplyFilter={(filter) =>
                        dispatch({ type: "ADD_FILTER", filter })
                    }
                />
            )}
        </>
    );
}

export default Filtering;
