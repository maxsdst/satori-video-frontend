import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

function UserVideosSection() {
    return (
        <Tabs isLazy>
            <TabList>
                <Tab width="100%" maxWidth="200px">
                    Videos
                </Tab>
                <Tab width="100%" maxWidth="200px">
                    Liked
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <p>Videos</p>
                </TabPanel>
                <TabPanel>
                    <p>Liked</p>
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}

export default UserVideosSection;
