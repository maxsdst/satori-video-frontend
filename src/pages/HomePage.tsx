import { Spinner, Text } from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffectOnce } from "react-use";
import MainContentArea from "../components/MainContentArea";
import VideoGrid from "../components/VideoGrid";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../constants";
import useResetTitle from "../hooks/useResetTitle";
import useRecommendedVideos, {
    RecommendedVideosQuery,
} from "../hooks/videos/useRecommendedVideos";
import { getAllResultsFromInfiniteQueryData } from "../utils";
import { VideoSource } from "./VideoPage";

function HomePage() {
    useResetTitle();

    const query: RecommendedVideosQuery = {
        pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
    };

    const {
        data,
        hasNextPage,
        fetchNextPage,
        isLoading,
        isSuccess,
        error,
        remove,
        refetch,
    } = useRecommendedVideos(query, { staleTime: Infinity });

    useEffectOnce(() => {
        if (data) {
            remove();
            void refetch();
        }
    });

    if (error) throw error;

    const videos = data ? getAllResultsFromInfiniteQueryData(data) : [];

    return (
        <MainContentArea isContentCentered={false}>
            {isSuccess && videos.length === 0 && (
                <Text>
                    No recommendations available right now. Check back later for
                    new videos!
                </Text>
            )}
            <InfiniteScroll
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={null}
                dataLength={videos.length}
                scrollThreshold="50px"
                style={{ overflowX: "hidden" }}
            >
                <VideoGrid
                    videos={videos}
                    showUsers={true}
                    showLikes={true}
                    videoLinkState={{
                        videoSource: VideoSource.Recommended,
                        query,
                    }}
                />
                {(hasNextPage || isLoading) && (
                    <Spinner role="progressbar" marginTop={4} />
                )}
            </InfiniteScroll>
        </MainContentArea>
    );
}

export default HomePage;
