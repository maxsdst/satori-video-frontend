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

    useEffectOnce(() => {
        if (data) {
            remove();
            refetch();
        }
    });

    if (error) throw error;

    const videos = data ? getAllResultsFromInfiniteQueryData(data) : [];

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
                <TabPanel padding={0} marginTop={4}></TabPanel>
            </TabPanels>
        </Tabs>
    );
}

export default UserVideosSection;
