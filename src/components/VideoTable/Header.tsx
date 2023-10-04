import { HStack, Icon, Text } from "@chakra-ui/react";
import { HeaderContext } from "@tanstack/table-core";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import Video from "../../entities/Video";

interface Props {
    header: HeaderContext<Video, any>;
    children: string;
}

function Header({ header, children }: Props) {
    const sortIcons = {
        asc: FaSortUp,
        desc: FaSortDown,
        none: FaSort,
    };

    const isSortable = header.column.getCanSort();
    const sortDirection = header.column.getIsSorted();

    return (
        <HStack
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
