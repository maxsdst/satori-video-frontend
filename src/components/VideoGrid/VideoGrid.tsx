import { SimpleGrid } from "@chakra-ui/react";
import Video from "../../entities/Video";
import { LocationState } from "../../pages/VideoPage";
import Item from "./Item";

interface VideoLinkState {
    videoSource?: LocationState["videoSource"];
    query?: LocationState["query"];
}

interface Props {
    videos: Video[];
    showUsers: boolean;
    showLikes: boolean;
    videoLinkState?: VideoLinkState;
}

function VideoGrid({ videos, showUsers, showLikes, videoLinkState }: Props) {
    return (
        <SimpleGrid
            columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            spacingX={4}
            spacingY={10}
            width="100%"
        >
            {videos.map((video, index) => (
                <Item
                    key={video.id}
                    video={video}
                    showUser={showUsers}
                    showLikes={showLikes}
                    videoLinkState={{
                        ...videoLinkState,
                        initialVideoIndex: index,
                    }}
                />
            ))}
        </SimpleGrid>
    );
}

export default VideoGrid;
