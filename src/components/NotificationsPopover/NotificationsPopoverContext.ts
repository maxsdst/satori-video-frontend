import { createContext } from "react";

interface NotificationsPopoverContextType {
    closePopover: () => void;
}

const NotificationsPopoverContext =
    createContext<NotificationsPopoverContextType>(
        {} as NotificationsPopoverContextType
    );

export default NotificationsPopoverContext;
