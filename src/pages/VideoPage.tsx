import { Flex, Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import VideoSequence from "../components/VideoSequence";
import useVideo from "../hooks/useVideo";
import { MAIN_CONTENT_AREA_PADDING } from "../styleConstants";

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
            alignItems="start"
            paddingX={MAIN_CONTENT_AREA_PADDING}
            paddingTop={MAIN_CONTENT_AREA_PADDING}
        >
            <VideoSequence videos={[video, video, video]} />
        </Flex>
    );
}

export default VideoPage;
