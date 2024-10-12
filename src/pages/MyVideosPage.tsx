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
import UploadTable, { UploadTableHandle } from "../components/UploadTable";
import VideoTable, { VideoTableHandle } from "../components/VideoTable";
import useTitle from "../hooks/useTitle";

interface Props {
    tabName: "videos" | "uploads";
}

function MyVideosPage({ tabName }: Props) {
    useTitle(tabName == "videos" ? "My videos" : "Uploads");

    const tabs = [
        { name: "videos", pathname: "/my_videos" },
        { name: "uploads", pathname: "/uploads" },
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
    const uploadTable = useRef<UploadTableHandle>(null);

    return (
        <>
            <MainContentArea isContentCentered={false}>
                <Tabs
                    isLazy
                    width="100%"
                    index={tabs.findIndex((tab) => tab.name === tabName)}
                    onChange={(index) => navigate(tabs[index].pathname)}
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
                        <TabPanel padding={0}>
                            <UploadTable ref={uploadTable} />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </MainContentArea>
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={handleUploadModalClose}
                onUploadCreated={() => uploadTable.current?.refetchUploads()}
                onVideoMutated={() => {
                    videoTable.current?.refetchVideos();
                    uploadTable.current?.refetchUploads();
                }}
            />
        </>
    );
}

export default MyVideosPage;
