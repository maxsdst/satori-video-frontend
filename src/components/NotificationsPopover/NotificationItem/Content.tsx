import {
    AspectRatio,
    Avatar,
    Box,
    Link as ChakraLink,
    HStack,
    Icon,
    Image,
    Text,
    VStack,
} from "@chakra-ui/react";
import { formatDistanceToNowStrict } from "date-fns";
import { useContext } from "react";
import { IconType } from "react-icons";
import { Link } from "react-router-dom";
import Notification from "../../../entities/Notification";
import NotificationsPopoverContext from "../NotificationsPopoverContext";
import ActionMenu from "./ActionMenu";

interface Props {
    notification: Notification;
    showIcon?: boolean;
    avatar?: string | null;
    icon?: IconType;
    username?: string;
    text: string;
    videoThumbnail?: string;
    onClick: () => void;
}

function Content({
    notification,
    showIcon,
    avatar,
    icon,
    username,
    text,
    videoThumbnail,
    onClick,
}: Props) {
    const { closePopover } = useContext(NotificationsPopoverContext);

    return (
        <HStack
            width="100%"
            paddingX={4}
            paddingY={2}
            spacing={4}
            _hover={{
                backgroundColor: "whiteAlpha.200",
            }}
            cursor="pointer"
            onClick={() => {
                onClick();
                closePopover();
            }}
        >
            <HStack justifyContent="center" minWidth={10} minHeight={10}>
                {showIcon ? (
                    <Icon as={icon} boxSize={7} />
                ) : (
                    <Avatar size="sm" src={avatar || undefined} />
                )}
            </HStack>
            <VStack
                width="100%"
                alignItems="start"
                spacing={1}
                overflow="hidden"
            >
                <Text fontSize="sm" noOfLines={2} width="100%">
                    {username && (
                        <>
                            <ChakraLink
                                as={Link}
                                to={"/users/" + username}
                                fontWeight="semibold"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closePopover();
                                }}
                            >
                                @{username}
                            </ChakraLink>{" "}
                        </>
                    )}
                    {text}
                </Text>
                <Text fontSize="xs">
                    {formatDistanceToNowStrict(notification.creation_date)} ago
                </Text>
            </VStack>
            <HStack>
                <Box minWidth={10} marginLeft={6}>
                    {videoThumbnail && (
                        <AspectRatio minWidth={10} maxWidth={10} ratio={3 / 4}>
                            <Image objectFit="cover" src={videoThumbnail} />
                        </AspectRatio>
                    )}
                </Box>
                <ActionMenu notification={notification} />
            </HStack>
        </HStack>
    );
}

export default Content;
