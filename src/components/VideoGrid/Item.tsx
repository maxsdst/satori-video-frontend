import {
    AspectRatio,
    Avatar,
    Box,
    HStack,
    Icon,
    IconButton,
    Image,
    Menu,
    MenuButton,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { AiOutlineHeart } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { PiPlay } from "react-icons/pi";
import { Link } from "react-router-dom";
import Video from "../../entities/Video";
import { LocationState } from "../../pages/VideoPage";
import { formatNumber } from "../../utils";

interface Props {
    video: Video;
    showUser: boolean;
    showLikes: boolean;
    videoLinkState: LocationState;
    actionMenuList?: (props: { video: Video }) => ReactNode;
}

function Item({
    video,
    showUser,
    showLikes,
    videoLinkState,
    actionMenuList,
}: Props) {
    const {
        isOpen: isActionMenuOpen,
        onOpen: openActionMenu,
        onClose: closeActionMenu,
    } = useDisclosure();

    return (
        <VStack
            data-testid="video-grid-item"
            maxWidth="600px"
            alignItems="start"
        >
            <Box
                as={Link}
                to={"/videos/" + video.id}
                position="relative"
                width="100%"
                state={videoLinkState}
            >
                <AspectRatio width="100%" ratio={3 / 4}>
                    <Image
                        aria-label="Video thumbnail"
                        objectFit="cover"
                        src={video.thumbnail}
                    />
                </AspectRatio>
                {actionMenuList && (
                    <Menu isOpen={isActionMenuOpen} onClose={closeActionMenu}>
                        <MenuButton
                            as={IconButton}
                            icon={<Icon as={BsThreeDotsVertical} boxSize={5} />}
                            variant="ghost"
                            size="sm"
                            borderRadius="50%"
                            padding={0}
                            aria-label="Action menu"
                            position="absolute"
                            top={2}
                            right={2}
                            onClick={(e) => {
                                e.preventDefault();
                                openActionMenu();
                            }}
                        />
                        {actionMenuList({ video })}
                    </Menu>
                )}
                <VStack
                    position="absolute"
                    bottom={0}
                    width="100%"
                    height="100px"
                    backgroundImage="linear-gradient(rgb(0, 0, 0, 0), rgb(0, 0, 0, 0.5))"
                    justifyContent="end"
                >
                    <HStack
                        width="100%"
                        justifyContent="space-between"
                        padding={3}
                    >
                        <HStack aria-label="Number of views" spacing={1}>
                            <Icon as={PiPlay} boxSize={4} />
                            <Text fontSize="md">
                                {formatNumber(video.view_count)}
                            </Text>
                        </HStack>
                    </HStack>
                </VStack>
            </Box>
            {video.title && (
                <Link
                    to={"/videos/" + video.id}
                    style={{ width: "100%" }}
                    state={videoLinkState}
                >
                    <Text
                        aria-label="Video title"
                        fontSize="md"
                        noOfLines={1}
                        fontWeight="medium"
                        width="100%"
                        overflowWrap="anywhere"
                    >
                        {video.title}
                    </Text>
                </Link>
            )}
            {(showUser || showLikes) && (
                <HStack width="100%" justifyContent="space-between">
                    {showUser && (
                        <Link to={"/users/" + video.profile.user.username}>
                            <HStack>
                                <Avatar
                                    aria-label="Author's avatar"
                                    size="xs"
                                    src={video.profile.avatar || undefined}
                                />
                                <Text aria-label="Author's username">
                                    {video.profile.user.username}
                                </Text>
                            </HStack>
                        </Link>
                    )}
                    {showLikes && (
                        <HStack aria-label="Number of likes" spacing={1}>
                            <Icon as={AiOutlineHeart} boxSize={4} />
                            <Text fontSize="md">
                                {formatNumber(video.like_count)}
                            </Text>
                        </HStack>
                    )}
                </HStack>
            )}
        </VStack>
    );
}

export default Item;
