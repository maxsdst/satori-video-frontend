import { Spinner, Text, VStack } from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffectOnce } from "react-use";
import VideoGrid from "../../components/VideoGrid";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../../constants";
import useSavedVideos, {
    SavedVideosQuery,
} from "../../hooks/saved_videos/useSavedVideos";
import { VideoSource } from "../../pages/VideoPage";
import { getAllResultsFromInfiniteQueryData } from "../../utils";
import ActionMenuList from "./ActionMenuList";

function SavedVideos() {
    const query: SavedVideosQuery = {
        pagination: {
            type: "limit_offset",
            limit: VIDEO_SEQUENCE_PAGE_SIZE,
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
    } = useSavedVideos(query, { staleTime: Infinity });

    useEffectOnce(() => {
        if (data) {
            remove();
            void refetch();
        }
    });

    if (error) throw error;

    const videos = data
        ? getAllResultsFromInfiniteQueryData(data).map((item) => item.video)
        : [];

    return (
        <VStack alignItems="start" width="100%" spacing={12}>
            <Text fontSize="3xl" fontWeight="semibold">
                Saved videos
            </Text>
            {isSuccess && videos.length === 0 && (
                <Text>Your saved videos list is empty.</Text>
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
                    showLikes={false}
                    videoLinkState={{
                        videoSource: VideoSource.SavedVideos,
                        query,
                    }}
                    actionMenuList={ActionMenuList}
                />
                {(hasNextPage || isLoading) && (
                    <Spinner role="progressbar" marginTop={4} />
                )}
            </InfiniteScroll>
        </VStack>
    );
}

export default SavedVideos;
