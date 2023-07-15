import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import VideoGrid from "./VideoGrid";

function UserVideosSection() {
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
                    <VideoGrid />
                </TabPanel>
                <TabPanel padding={0} marginTop={4}>
                    <VideoGrid />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}

export default UserVideosSection;
