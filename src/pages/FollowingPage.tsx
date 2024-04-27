import { Spinner, Text, VStack } from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffectOnce } from "react-use";
import MainContentArea from "../components/MainContentArea";
import VideoGrid from "../components/VideoGrid";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../constants";
import useFollowingVideos, {
    FollowingVideosQuery,
} from "../hooks/videos/useFollowingVideos";
import { getAllResultsFromInfiniteQueryData } from "../utils";
import { VideoSource } from "./VideoPage";

function FollowingPage() {
    const query: FollowingVideosQuery = {
        pagination: {
            type: "cursor",
            pageSize: VIDEO_SEQUENCE_PAGE_SIZE,
        },
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
    } = useFollowingVideos(query, { staleTime: Infinity });

    useEffectOnce(() => {
        if (data) {
            remove();
            refetch();
        }
    });

    if (error) throw error;

    const videos = data ? getAllResultsFromInfiniteQueryData(data) : [];

    return (
        <MainContentArea isContentCentered={false}>
            <VStack alignItems="start" width="100%" spacing={12}>
                <Text fontSize="3xl" fontWeight="semibold">
                    Following
                </Text>
                {isSuccess && videos.length === 0 && (
                    <Text>No videos from profiles you're following yet.</Text>
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
                            videoSource: VideoSource.Following,
                            query,
                        }}
                    />
                    {(hasNextPage || isLoading) && <Spinner marginTop={4} />}
                </InfiniteScroll>
            </VStack>
        </MainContentArea>
    );
}

export default FollowingPage;
