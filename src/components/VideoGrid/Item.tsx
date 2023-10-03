import {
    AspectRatio,
    Avatar,
    HStack,
    Icon,
    Image,
    Text,
    VStack,
} from "@chakra-ui/react";
import { AiOutlineHeart } from "react-icons/ai";
import { PiPlay } from "react-icons/pi";
import { Link } from "react-router-dom";
import Video from "../../entities/Video";

interface Props {
    video: Video;
    showUser: boolean;
    showLikes: boolean;
}

function Item({ video, showUser, showLikes }: Props) {
    return (
        <VStack maxWidth="600px" alignItems="start">
            <AspectRatio width="100%" ratio={3 / 4}>
                <Link to={"/videos/" + video.id}>
                    <Image objectFit="cover" src={video.thumbnail} />
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
                            <HStack spacing={0.5}>
                                <Icon as={PiPlay} boxSize={5} />
                                <Text fontSize="md">12.3M</Text>
                            </HStack>
                        </HStack>
                    </VStack>
                </Link>
            </AspectRatio>
            {video.title && (
                <Link to={"/videos/" + video.id} style={{ width: "100%" }}>
                    <Text
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
                                    size="xs"
                                    src={video.profile.avatar || undefined}
                                />
                                <Text>{video.profile.user.username}</Text>
                            </HStack>
                        </Link>
                    )}
                    {showLikes && (
                        <HStack spacing={0.5}>
                            <Icon as={AiOutlineHeart} boxSize={5} />
                            <Text fontSize="md">12.3K</Text>
                        </HStack>
                    )}
                </HStack>
            )}
        </VStack>
    );
}

export default Item;
