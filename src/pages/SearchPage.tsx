import {
    Flex,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "react-router-dom";
import { useEffectOnce } from "react-use";
import MainContentArea from "../components/MainContentArea";
import ProfileList from "../components/ProfileList";
import VideoGrid from "../components/VideoGrid";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../constants";
import useProfileSearch from "../hooks/profiles/useProfileSearch";
import useVideoSearch, {
    VideoSearchQuery,
} from "../hooks/videos/useVideoSearch";
import { getAllResultsFromInfiniteQueryData } from "../utils";
import { VideoSource } from "./VideoPage";

function SearchPage() {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("query") || "";

    const query: VideoSearchQuery = {
        searchQuery,
        pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
    };

    const {
        data: videoSearchResults,
        hasNextPage: hasNextPageVideos,
        fetchNextPage: fetchNextPageVideos,
        isLoading: isLoadingVideos,
        error: errorVideos,
        isSuccess: isSuccessVideos,
        remove,
        refetch,
    } = useVideoSearch(query, { staleTime: Infinity });

    useEffectOnce(() => {
        if (videoSearchResults) {
            remove();
            refetch();
        }
    });

    const {
        data: profileSearchResults,
        hasNextPage: hasNextPageProfiles,
        fetchNextPage: fetchNextPageProfiles,
        isLoading: isLoadingProfiles,
        error: errorProfiles,
        isSuccess: isSuccessProfiles,
    } = useProfileSearch(
        {
            searchQuery,
            pagination: { type: "cursor", pageSize: 20 },
        },
        {}
    );

    if (errorVideos) throw errorVideos;
    if (errorProfiles) throw errorProfiles;

    const videos = videoSearchResults
        ? getAllResultsFromInfiniteQueryData(videoSearchResults)
        : [];

    const profiles = profileSearchResults
        ? getAllResultsFromInfiniteQueryData(profileSearchResults)
        : [];

    return (
        <MainContentArea isContentCentered={false}>
            <Tabs width="100%">
                <TabList marginBottom={4}>
                    <Tab width="100%" maxWidth="200px">
                        Videos
                    </Tab>
                    <Tab width="100%" maxWidth="200px">
                        Users
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel width="100%" padding={0}>
                        {isSuccessVideos && videos.length === 0 && (
                            <Flex
                                width="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Text>No videos found</Text>
                            </Flex>
                        )}
                        <InfiniteScroll
                            next={fetchNextPageVideos}
                            hasMore={!!hasNextPageVideos}
                            loader={null}
                            dataLength={videos.length}
                            scrollThreshold="50px"
                        >
                            <VideoGrid
                                videos={videos}
                                showUsers={true}
                                showLikes={true}
                                videoLinkState={{
                                    videoSource: VideoSource.Search,
                                    query,
                                }}
                            />
                            {(hasNextPageVideos || isLoadingVideos) && (
                                <Spinner marginTop={4} />
                            )}
                        </InfiniteScroll>
                    </TabPanel>
                    <TabPanel width="100%" padding={0}>
                        {isSuccessProfiles && profiles.length === 0 && (
                            <Flex
                                width="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Text>No users found</Text>
                            </Flex>
                        )}
                        <InfiniteScroll
                            next={fetchNextPageProfiles}
                            hasMore={!!hasNextPageProfiles}
                            loader={null}
                            dataLength={profiles.length}
                            scrollThreshold="50px"
                        >
                            <ProfileList profiles={profiles} />
                            {(hasNextPageProfiles || isLoadingProfiles) && (
                                <Spinner marginTop={4} />
                            )}
                        </InfiniteScroll>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </MainContentArea>
    );
}

export default SearchPage;
