import { Avatar, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Video from "../../entities/Video";
import { PLAYER_DROP_SHADOW } from "../../styleConstants";

interface Props {
    video: Video;
}

function VideoInfo({ video }: Props) {
    return (
        <VStack
            paddingX={4}
            paddingBottom={4}
            alignItems="start"
            spacing={1}
            filter={PLAYER_DROP_SHADOW}
            width="100%"
            zIndex={2}
            onTouchStartCapture={(e) => e.stopPropagation()}
        >
            <Link to={"/users/" + video.profile.user.username}>
                <HStack>
                    <Avatar size="xs" src={video.profile.avatar || undefined} />
                    <Heading fontSize="sm">
                        {video.profile.user.username}
                    </Heading>
                </HStack>
            </Link>
            {video.title && (
                <Text fontSize="sm" noOfLines={1} width="100%">
                    {video.title}
                </Text>
            )}
        </VStack>
    );
}

export default VideoInfo;
