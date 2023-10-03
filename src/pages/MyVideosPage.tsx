import {
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainContentArea from "../components/MainContentArea";
import UploadModal from "../components/UploadModal";
import VideoTable, { VideoTableHandle } from "../components/VideoTable";

interface Props {
    tabName: "videos" | "uploads";
}

function MyVideosPage({ tabName }: Props) {
    const tabs = [
        { name: "videos", path: "/my_videos" },
        { name: "uploads", path: "/uploads" },
    ];

    const [params] = useSearchParams();
    const navigate = useNavigate();

    const shouldOpenUploadModal =
        tabName === "uploads" && typeof params.get("upload") === "string";

    const {
        isOpen: isUploadModalOpen,
        onOpen: openUploadModal,
        onClose: closeUploadModal,
    } = useDisclosure({ defaultIsOpen: shouldOpenUploadModal });

    useEffect(() => {
        if (shouldOpenUploadModal) openUploadModal();
    }, [shouldOpenUploadModal]);

    function handleUploadModalClose() {
        closeUploadModal();
        navigate("/uploads");
    }

    const videoTable = useRef<VideoTableHandle>(null);

    return (
        <>
            <MainContentArea isContentCentered={false}>
                <Tabs
                    width="100%"
                    index={tabs.findIndex((tab) => tab.name === tabName)}
                    onChange={(index) => navigate(tabs[index].path)}
                >
                    <TabList marginBottom={4}>
                        <Tab width="100%" maxWidth="200px">
                            Videos
                        </Tab>
                        <Tab width="100%" maxWidth="200px">
                            Uploads
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel padding={0}>
                            <VideoTable ref={videoTable} />
                        </TabPanel>
                        <TabPanel>
                            <p>uploads</p>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </MainContentArea>
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={handleUploadModalClose}
                onVideoMutated={() => videoTable.current?.refetchVideos()}
            />
        </>
    );
}

export default MyVideosPage;
