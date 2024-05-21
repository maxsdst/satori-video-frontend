import {
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffectOnce } from "react-use";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../constants";
import useLikes, { LikesQuery } from "../hooks/likes/useLikes";
import useVideos, { VideoQuery } from "../hooks/videos/useVideos";
import { VideoSource } from "../pages/VideoPage";
import { getAllResultsFromInfiniteQueryData } from "../utils";
import VideoGrid from "./VideoGrid";

interface Props {
    profileId: number;
}

function UserVideosSection({ profileId }: Props) {
    const query: VideoQuery = {
        profileId,
        pagination: { type: "limit_offset", limit: VIDEO_SEQUENCE_PAGE_SIZE },
        ordering: { field: "upload_date", direction: "DESC" },
    };
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        remove,
        refetch,
    } = useVideos(query, { staleTime: Infinity });

    const queryLikes: LikesQuery = {
        profileId,
        pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
    };
    const {
        data: dataLikes,
        isLoading: isLoadingLikes,
        error: errorLikes,
        fetchNextPage: fetchNextPageLikes,
        hasNextPage: hasNextPageLikes,
        remove: removeLikes,
        refetch: refetchLikes,
    } = useLikes(queryLikes, { staleTime: Infinity });

    useEffectOnce(() => {
        if (data) {
            remove();
            refetch();
        }
        if (dataLikes) {
            removeLikes();
            refetchLikes();
        }
    });

    if (error) throw error;
    if (errorLikes) throw errorLikes;

    const videos = data ? getAllResultsFromInfiniteQueryData(data) : [];
    const likedVideos = dataLikes
        ? getAllResultsFromInfiniteQueryData(dataLikes).map(
              (item) => item.video
          )
        : [];

    return (
        <Tabs isLazy width="100%">
            <TabList>
                <Tab width="100%" maxWidth="200px">
                    Videos
                </Tab>
                <Tab width="100%" maxWidth="200px">
                    Liked
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel padding={0} marginTop={4}>
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
                            showUsers={false}
                            showLikes={false}
                            videoLinkState={{
                                videoSource: VideoSource.Videos,
                                query,
                            }}
                        />
                        {(hasNextPage || isLoading) && (
                            <Spinner marginTop={4} />
                        )}
                    </InfiniteScroll>
                </TabPanel>
                <TabPanel padding={0} marginTop={4}>
                    <InfiniteScroll
                        next={fetchNextPageLikes}
                        hasMore={!!hasNextPageLikes}
                        loader={null}
                        dataLength={likedVideos.length}
                        scrollThreshold="50px"
                        style={{ overflowX: "hidden" }}
                    >
                        <VideoGrid
                            videos={likedVideos}
                            showUsers={true}
                            showLikes={false}
                            videoLinkState={{
                                videoSource: VideoSource.Likes,
                                query: queryLikes,
                            }}
                        />
                        {(hasNextPageLikes || isLoadingLikes) && (
                            <Spinner marginTop={4} />
                        )}
                    </InfiniteScroll>
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}

export default UserVideosSection;
