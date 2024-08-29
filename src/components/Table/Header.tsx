import { HStack, Icon, Text } from "@chakra-ui/react";
import { HeaderContext } from "@tanstack/table-core";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

interface Props<T> {
    header: HeaderContext<T, any>;
    children: string;
}

function Header<T>({ header, children }: Props<T>) {
    const sortIcons = {
        asc: FaSortUp,
        desc: FaSortDown,
        none: FaSort,
    };

    const isSortable = header.column.getCanSort();
    const sortDirection = header.column.getIsSorted();

    return (
        <HStack
            role="button"
            width="fit-content"
            height={8}
            _hover={isSortable ? { cursor: "pointer" } : undefined}
            onClick={
                isSortable ? header.column.getToggleSortingHandler() : undefined
            }
        >
            <Text>{children}</Text>
            {isSortable && (
                <Icon
                    as={
                        sortDirection
                            ? sortIcons[sortDirection]
                            : sortIcons.none
                    }
                />
            )}
        </HStack>
    );
}

export default Header;
