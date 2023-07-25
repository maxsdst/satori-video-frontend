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
import { Link } from "react-router-dom";
import Video from "../entities/Video";

interface Props {
    video: Video;
}

function VideoGridItem({ video }: Props) {
    return (
        <VStack maxWidth="600px" alignItems="start">
            <AspectRatio width="100%" ratio={3 / 4}>
                <Link to={"/videos/" + video.id}>
                    <Image objectFit="cover" src={video.thumbnail} />
                </Link>
            </AspectRatio>
            {video.title && (
                <Link to={"/videos/" + video.id}>
                    <Text fontSize="md" noOfLines={1}>
                        {video.title}
                    </Text>
                </Link>
            )}
            <HStack width="100%" justifyContent="space-between">
                <Link to={"/users/" + video.profile.user.username}>
                    <HStack>
                        <Avatar
                            size="xs"
                            src={video.profile.avatar || undefined}
                        />
                        <Text>{video.profile.user.username}</Text>
                    </HStack>
                </Link>
                <HStack spacing={1}>
                    <Icon as={AiOutlineHeart} boxSize="22px" />
                    <Text fontSize="md">12.3K</Text>
                </HStack>
            </HStack>
        </VStack>
    );
}

export default VideoGridItem;
