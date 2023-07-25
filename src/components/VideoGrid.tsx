import { SimpleGrid, Spinner } from "@chakra-ui/react";
import useVideos, { VideoQuery } from "../hooks/useVideos";
import VideoGridItem from "./VideoGridItem";

interface Props {
    videoQuery: VideoQuery;
}

function VideoGrid({ videoQuery }: Props) {
    const { data: videos, isLoading, error } = useVideos(videoQuery);
    if (isLoading) return <Spinner />;
    if (error) throw error;

    return (
        <SimpleGrid
            columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            spacingX={4}
            spacingY={10}
        >
            {videos.map((video) => (
                <VideoGridItem key={video.id} video={video} />
            ))}
        </SimpleGrid>
    );
}

export default VideoGrid;
