import { Spinner, Text, VStack } from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffectOnce } from "react-use";
import MainContentArea from "../components/MainContentArea";
import VideoGrid from "../components/VideoGrid";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../constants";
import usePopularVideos, {
    PopularVideosQuery,
} from "../hooks/videos/usePopularVideos";
import { getAllResultsFromInfiniteQueryData } from "../utils";
import { VideoSource } from "./VideoPage";

function PopularPage() {
    const query: PopularVideosQuery = {
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
    } = usePopularVideos(query, { staleTime: Infinity });

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
            <VStack alignItems="start" width="100%" spacing={12}>
                <Text fontSize="3xl" fontWeight="semibold">
                    Popular
                </Text>
                {isSuccess && videos.length === 0 && (
                    <Text>
                        No popular videos at the moment. Check back later to see
                        what's trending!
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
                            videoSource: VideoSource.Popular,
                            query,
                        }}
                    />
                    {(hasNextPage || isLoading) && (
                        <Spinner role="progressbar" marginTop={4} />
                    )}
                </InfiniteScroll>
            </VStack>
        </MainContentArea>
    );
}

export default PopularPage;
