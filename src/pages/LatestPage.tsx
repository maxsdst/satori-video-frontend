import { Spinner, Text, VStack } from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffectOnce } from "react-use";
import MainContentArea from "../components/MainContentArea";
import VideoGrid from "../components/VideoGrid";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../constants";
import useLatestVideos, {
    LatestVideosQuery,
} from "../hooks/videos/useLatestVideos";
import { getAllResultsFromInfiniteQueryData } from "../utils";
import { VideoSource } from "./VideoPage";

function LatestPage() {
    const query: LatestVideosQuery = {
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
    } = useLatestVideos(query, { staleTime: Infinity });

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
                    Latest
                </Text>
                {isSuccess && videos.length === 0 && (
                    <Text>
                        No latest videos right now. Check back soon for new
                        content!
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
                            videoSource: VideoSource.Latest,
                            query,
                        }}
                    />
                    {(hasNextPage || isLoading) && <Spinner marginTop={4} />}
                </InfiniteScroll>
            </VStack>
        </MainContentArea>
    );
}

export default LatestPage;
