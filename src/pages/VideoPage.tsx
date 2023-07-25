import { Flex, Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import Player from "../components/Player";
import useVideo from "../hooks/useVideo";

function VideoPage() {
    const { videoId } = useParams();

    const { data: video, isLoading, error } = useVideo(parseInt(videoId!));
    if (isLoading) return <Spinner />;
    if (error) throw error;

    return (
        <Flex
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
        >
            <Player video={video} />
        </Flex>
    );
}

export default VideoPage;
