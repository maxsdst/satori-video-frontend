import {
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@chakra-ui/react";
import useVideos from "../hooks/videos/useVideos";
import VideoGrid from "./VideoGrid";

interface Props {
    profileId: number;
}

function UserVideosSection({ profileId }: Props) {
    const { data: videos, isLoading, error } = useVideos({ profileId }, {});
    if (error) throw error;

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
                    {isLoading && <Spinner />}
                    {videos?.results && (
                        <VideoGrid
                            videos={videos.results}
                            showUsers={false}
                            showLikes={false}
                        />
                    )}
                </TabPanel>
                <TabPanel padding={0} marginTop={4}>
                    {isLoading && <Spinner />}
                    {videos?.results && (
                        <VideoGrid
                            videos={videos.results}
                            showUsers={false}
                            showLikes={false}
                        />
                    )}
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}

export default UserVideosSection;
