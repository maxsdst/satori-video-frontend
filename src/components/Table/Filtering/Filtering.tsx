import {
    Box,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    List,
    ListItem,
    ListItemProps,
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
import BooleanFilterModal from "./BooleanFilterModal";
import CharFilterModal from "./CharFilterModal";
import NumberFilterModal from "./NumberFilterModal";
import filteringReducer, { FilteringOption } from "./filteringReducer";

interface Props {
    options: FilteringOption[];
    mainField: string;
    onChange: (appliedFilters: Filter[]) => void;
}

function Filtering({ options, mainField, onChange }: Props) {
    const [{ availableOptions, appliedFilters }, dispatch] = useReducer(
        filteringReducer,
        {
            options,
            availableOptions: options,
            appliedFilters: [],
        }
    );

    const [input, setInput] = useState("");

    const [selectedOption, setSelectedOption] =
        useState<FilteringOption | null>();

    const filteredOptions = availableOptions.filter(
        (option) => !input || option.name.toLowerCase().startsWith(input)
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
        icontains: " contains ",
        lte: " <= ",
        gte: " >= ",
        exact: ": ",
    };

    const mainOption = options.find((option) => option.field === mainField);
    if (mainOption?.type !== "char")
        throw "Main filtering field must be a text field";

    const isMainOptionAvailable = !!availableOptions.find(
        (option) => option.field === mainField
    );

    const itemProps: ListItemProps = {
        width: "100%",
        paddingX: 4,
        paddingY: 2,
        cursor: "pointer",
        _hover: { backgroundColor: "whiteAlpha.200" },
        fontWeight: "semibold",
        noOfLines: 1,
    };

    const mainOptionText = `${mainOption.name} contains "${input}"`;

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
                    <HStack
                        aria-label="Applied filters"
                        role="list"
                        flexWrap="wrap"
                    >
                        {appliedFilters.map((filter) => {
                            const optionName = options.find(
                                (option) => option.field === filter.field
                            )?.name;

                            return (
                                <Box
                                    key={filter.field}
                                    role="listitem"
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
                                            {optionName}
                                            {lookupTypeNames[filter.lookupType]}
                                            {filter.type === "char" &&
                                                `"${filter.value}"`}
                                            {filter.type === "number" &&
                                                filter.value}
                                            {filter.type === "boolean" &&
                                                (filter.value ? "Yes" : "No")}
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
                            );
                        })}
                    </HStack>
                </VStack>
                <PopoverContent
                    aria-label="Filtering options"
                    ref={popoverRef}
                    width="fit-content"
                    minWidth="xs"
                    maxWidth="97.5vw"
                >
                    <PopoverBody paddingX={0} paddingY={2}>
                        <List>
                            {input && isMainOptionAvailable && (
                                <ListItem
                                    aria-label={mainOptionText}
                                    {...itemProps}
                                    onClick={() => {
                                        dispatch({
                                            type: "ADD_FILTER",
                                            filter: {
                                                field: mainOption.field,
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
                                    {mainOptionText}
                                </ListItem>
                            )}
                            {filteredOptions.map((option) => (
                                <ListItem
                                    aria-label={option.name}
                                    key={option.field}
                                    {...itemProps}
                                    onClick={() => {
                                        setSelectedOption(option);
                                        closeAutocomplete();
                                        openFilterModal();
                                    }}
                                >
                                    {option.name}
                                </ListItem>
                            ))}
                        </List>
                        {!isMainOptionAvailable &&
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
            {isFilterModalOpen && selectedOption?.type === "boolean" && (
                <BooleanFilterModal
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
