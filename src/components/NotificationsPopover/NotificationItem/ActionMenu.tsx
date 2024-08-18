import {
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
} from "@chakra-ui/react";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import Notification from "../../../entities/Notification";
import useDeleteNotification from "../../../hooks/notifications/useDeleteNotification";

interface Props {
    notification: Notification;
}

function ActionMenu({ notification }: Props) {
    const deleteNotification = useDeleteNotification(notification.id, {
        shouldUpdateNotificationsOptimistically: true,
    });

    return (
        <Menu placement="left-end">
            <MenuButton
                as={IconButton}
                icon={<Icon as={BsThreeDotsVertical} boxSize={5} />}
                variant="ghost"
                size="sm"
                borderRadius="50%"
                padding={0}
                aria-label="Action menu"
                onClick={(e) => e.stopPropagation()}
            />
            <MenuList aria-label="Actions">
                <MenuItem
                    icon={<Icon as={AiOutlineEyeInvisible} boxSize={5} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification.mutate(null);
                    }}
                >
                    Hide this notification
                </MenuItem>
            </MenuList>
        </Menu>
    );
}

export default ActionMenu;
