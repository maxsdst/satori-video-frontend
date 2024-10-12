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
import { useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "react-router-dom";
import { useEffectOnce } from "react-use";
import MainContentArea from "../components/MainContentArea";
import ProfileList from "../components/ProfileList";
import VideoGrid from "../components/VideoGrid";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../constants";
import useProfileSearch from "../hooks/profiles/useProfileSearch";
import useTitle from "../hooks/useTitle";
import useVideoSearch, {
    VideoSearchQuery,
} from "../hooks/videos/useVideoSearch";
import { getAllResultsFromInfiniteQueryData } from "../utils";
import { VideoSource } from "./VideoPage";

function SearchPage() {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("query") || "";

    useTitle(searchQuery);

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
            void refetch();
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

    const [tabIndex, setTabIndex] = useState(0);

    const videos = useMemo(() => {
        return videoSearchResults
            ? getAllResultsFromInfiniteQueryData(videoSearchResults)
            : [];
    }, [videoSearchResults]);

    const profiles = useMemo(() => {
        return profileSearchResults
            ? getAllResultsFromInfiniteQueryData(profileSearchResults)
            : [];
    }, [profileSearchResults]);

    const { fetchNext, hasNextPage, dataLength } = useMemo(() => {
        if (tabIndex === 0)
            return {
                fetchNext: () => void fetchNextPageVideos(),
                hasNextPage: !!hasNextPageVideos,
                dataLength: videos.length,
            };
        else
            return {
                fetchNext: () => void fetchNextPageProfiles(),
                hasNextPage: !!hasNextPageProfiles,
                dataLength: profiles.length,
            };
    }, [
        tabIndex,
        fetchNextPageVideos,
        hasNextPageVideos,
        videos,
        fetchNextPageProfiles,
        hasNextPageProfiles,
        profiles,
    ]);

    if (errorVideos) throw errorVideos;
    if (errorProfiles) throw errorProfiles;

    return (
        <MainContentArea isContentCentered={false}>
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
                                <Spinner role="progressbar" marginTop={4} />
                            )}
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
                            <ProfileList profiles={profiles} />
                            {(hasNextPageProfiles || isLoadingProfiles) && (
                                <Spinner role="progressbar" marginTop={4} />
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </InfiniteScroll>
        </MainContentArea>
    );
}

export default SearchPage;
