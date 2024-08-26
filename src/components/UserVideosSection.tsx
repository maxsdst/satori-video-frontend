import {
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
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
    const queryVideos: VideoQuery = {
        profileId,
        pagination: { type: "limit_offset", limit: VIDEO_SEQUENCE_PAGE_SIZE },
        ordering: { field: "upload_date", direction: "DESC" },
    };
    const videos = useVideos(queryVideos, { staleTime: Infinity });

    const queryLikes: LikesQuery = {
        profileId,
        pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
    };
    const likes = useLikes(queryLikes, { staleTime: Infinity });

    useEffectOnce(() => {
        if (videos.data) {
            videos.remove();
            void videos.refetch();
        }
        if (likes.data) {
            likes.remove();
            void likes.refetch();
        }
    });

    const [tabIndex, setTabIndex] = useState(0);

    const allVideos = useMemo(() => {
        return videos.data
            ? getAllResultsFromInfiniteQueryData(videos.data)
            : [];
    }, [videos.data]);

    const allLikedVideos = useMemo(() => {
        return likes.data
            ? getAllResultsFromInfiniteQueryData(likes.data).map(
                  (item) => item.video
              )
            : [];
    }, [likes.data]);

    const { fetchNext, hasNextPage, dataLength } = useMemo(() => {
        if (tabIndex === 0)
            return {
                fetchNext: () => void videos.fetchNextPage(),
                hasNextPage: !!videos.hasNextPage,
                dataLength: allVideos.length,
            };
        else
            return {
                fetchNext: () => void likes.fetchNextPage(),
                hasNextPage: !!likes.hasNextPage,
                dataLength: allLikedVideos.length,
            };
    }, [tabIndex, videos, allVideos, likes, allLikedVideos]);

    if (videos.error) throw videos.error;
    if (likes.error) throw likes.error;

    return (
        <InfiniteScroll
            next={fetchNext}
            hasMore={hasNextPage}
            loader={null}
            dataLength={dataLength}
            scrollThreshold="50px"
        >
            <Tabs
                tabIndex={tabIndex}
                onChange={(index) => setTabIndex(index)}
                width="100%"
            >
                <TabList>
                    <Tab width="100%" maxWidth="200px">
                        Videos
                    </Tab>
                    <Tab width="100%" maxWidth="200px">
                        Liked
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel padding={0} marginTop={4} overflowX="hidden">
                        <VideoGrid
                            videos={allVideos}
                            showUsers={false}
                            showLikes={false}
                            videoLinkState={{
                                videoSource: VideoSource.Videos,
                                query: queryVideos,
                            }}
                        />
                        {(hasNextPage || videos.isLoading) && (
                            <Spinner role="progressbar" marginTop={4} />
                        )}
                    </TabPanel>
                    <TabPanel padding={0} marginTop={4} overflowX="hidden">
                        <VideoGrid
                            videos={allLikedVideos}
                            showUsers={true}
                            showLikes={false}
                            videoLinkState={{
                                videoSource: VideoSource.Likes,
                                query: queryLikes,
                            }}
                        />
                        {(likes.hasNextPage || likes.isLoading) && (
                            <Spinner role="progressbar" marginTop={4} />
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </InfiniteScroll>
    );
}

export default UserVideosSection;
