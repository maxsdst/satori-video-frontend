import {
    Box,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    Popover,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Portal,
    Spinner,
    Text,
    useBreakpointValue,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import { AiOutlineBell } from "react-icons/ai";
import InfiniteScroll from "react-infinite-scroll-component";
import useMarkAsSeen from "../../hooks/notifications/useMarkAsSeen";
import useNotifications from "../../hooks/notifications/useNotifications";
import useUnseenCount from "../../hooks/notifications/useUnseenCount";
import { getAllResultsFromInfiniteQueryData } from "../../utils";
import IconButton from "../IconButton";
import NotificationItem from "./NotificationItem";
import NotificationsPopoverContext from "./NotificationsPopoverContext";

function NotificationsPopover() {
    const { isOpen, onClose, onToggle } = useDisclosure();

    const { data, isLoading, isSuccess, error, hasNextPage, fetchNextPage } =
        useNotifications(
            { pagination: { type: "cursor", pageSize: 10 } },
            { enabled: isOpen }
        );

    const markAsSeen = useMarkAsSeen({
        shouldUpdateNotificationsOptimistically: true,
    });

    const { data: unseenCount, error: errorUnseenCount } = useUnseenCount();

    const notifications = data ? getAllResultsFromInfiniteQueryData(data) : [];
    const unseenCountText = unseenCount
        ? unseenCount > 99
            ? "99+"
            : unseenCount.toString()
        : undefined;

    useEffect(() => {
        if (notifications.length === 0) return;
        const unseen = notifications.filter((item) => item.is_seen === false);
        if (unseen.length === 0) return;
        const ids = unseen.map((item) => item.id);
        markAsSeen.mutate({ notificationIds: ids });
    }, [notifications.length]);

    const trigger = (
        <IconButton
            label="Notifications"
            icon={AiOutlineBell}
            badgeText={unseenCountText}
            badgeColor="red.500"
            onClick={onToggle}
        />
    );

    const [scrollableTarget, setScrollableTarget] =
        useState<HTMLDivElement | null>(null);

    const body = !scrollableTarget ? null : (
        <NotificationsPopoverContext.Provider
            value={{
                closePopover: onClose,
            }}
        >
            <InfiniteScroll
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={null}
                dataLength={notifications.length}
                scrollableTarget={scrollableTarget as unknown as ReactElement}
                scrollThreshold="50px"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                {notifications.length === 0 && (
                    <Box padding={4}>
                        {isLoading && <Spinner role="progressbar" />}
                        {isSuccess && (
                            <Text>Your notifications are currently empty.</Text>
                        )}
                    </Box>
                )}
                {notifications.length > 0 && (
                    <VStack
                        role="list"
                        width="100%"
                        paddingBottom={hasNextPage ? "0.5rem" : undefined}
                    >
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))}
                        {hasNextPage && (
                            <Spinner role="progressbar" marginTop={2} />
                        )}
                    </VStack>
                )}
            </InfiniteScroll>
        </NotificationsPopoverContext.Provider>
    );

    const overlayType = useBreakpointValue<"modal" | "popover">({
        base: "modal",
        sm: "modal",
        md: "popover",
    });

    if (error) throw error;
    if (errorUnseenCount) throw errorUnseenCount;

    if (overlayType === "modal")
        return (
            <>
                {trigger}
                <Modal
                    isOpen={isOpen}
                    onClose={onClose}
                    isCentered
                    size="full"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        <ModalHeader>Notifications</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody
                            padding={0}
                            ref={(ref) => setScrollableTarget(ref)}
                        >
                            {body}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </>
        );

    return (
        <Popover isOpen={isOpen} onClose={onClose} closeOnBlur={true}>
            <PopoverTrigger>{trigger}</PopoverTrigger>
            <Portal>
                <PopoverContent
                    width="lg"
                    maxHeight="70vh"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <PopoverCloseButton />
                    <PopoverHeader>Notifications</PopoverHeader>
                    <PopoverBody
                        data-testid="notification-list-container"
                        padding={0}
                        overflowX="hidden"
                        overflowY="auto"
                        ref={(ref) => setScrollableTarget(ref)}
                    >
                        {body}
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    );
}

export default NotificationsPopover;
