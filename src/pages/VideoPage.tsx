import { Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import MainContentArea from "../components/MainContentArea";
import Player from "../components/Player";
import useVideo from "../hooks/useVideo";

function VideoPage() {
    const { videoId } = useParams();

    const { data: video, isLoading, error } = useVideo(parseInt(videoId!));
    if (isLoading) return <Spinner />;
    if (error) throw error;

    return (
        <MainContentArea isContentCentered={true}>
            <Player video={video} />
        </MainContentArea>
    );
}

export default VideoPage;
