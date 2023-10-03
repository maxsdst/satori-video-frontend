import { SimpleGrid, Spinner } from "@chakra-ui/react";
import useVideos, { VideoQuery } from "../../hooks/useVideos";
import Item from "./Item";

interface Props {
    videoQuery: VideoQuery;
    showUsers: boolean;
    showLikes: boolean;
}

function VideoGrid({ videoQuery, showUsers, showLikes }: Props) {
    const { data: videos, isLoading, error } = useVideos(videoQuery, {});
    if (isLoading) return <Spinner />;
    if (error) throw error;

    return (
        <SimpleGrid
            columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            spacingX={4}
            spacingY={10}
            width="100%"
        >
            {videos.results.map((video) => (
                <Item
                    key={video.id}
                    video={video}
                    showUser={showUsers}
                    showLikes={showLikes}
                />
            ))}
        </SimpleGrid>
    );
}

export default VideoGrid;
