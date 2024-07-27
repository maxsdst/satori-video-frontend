import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { MdOutlineSort } from "react-icons/md";
import IconButton from "../../../IconButton";

export type Ordering = "top" | "new";
export type OnOrderingChange = (ordering: Ordering) => void;

interface Props {
    onOrderingChange: OnOrderingChange;
}

function SortMenu({ onOrderingChange }: Props) {
    return (
        <Menu>
            <MenuButton as={IconButton} icon={MdOutlineSort} label="Sort" />
            <MenuList aria-label="Sort comments">
                <MenuItem onClick={() => onOrderingChange("top")}>
                    Top comments
                </MenuItem>
                <MenuItem onClick={() => onOrderingChange("new")}>
                    Newest first
                </MenuItem>
            </MenuList>
        </Menu>
    );
}

export default SortMenu;
