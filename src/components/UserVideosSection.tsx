import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import VideoGrid from "./VideoGrid";

interface Props {
    profileId: number;
}

function UserVideosSection({ profileId }: Props) {
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
                    <VideoGrid videoQuery={{ profileId }} />
                </TabPanel>
                <TabPanel padding={0} marginTop={4}>
                    <VideoGrid videoQuery={{ profileId }} />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}

export default UserVideosSection;
