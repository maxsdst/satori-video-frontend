import { Divider, VStack } from "@chakra-ui/react";
import {
    AiOutlineClockCircle,
    AiOutlineFire,
    AiOutlineHistory,
    AiOutlineHome,
    AiOutlinePlaySquare,
} from "react-icons/ai";
import { HiOutlineBookmark } from "react-icons/hi";
import { RiUserReceivedLine } from "react-icons/ri";
import { SIDENAV_WIDTH } from "../../styleConstants";
import SideNavButton from "./SideNavButton";

interface Props {
    isFullscreen: boolean;
    onClose: () => void;
}

function SideNav({ isFullscreen, onClose }: Props) {
    function close() {
        if (isFullscreen) onClose();
    }

    return (
        <VStack
            position="fixed"
            alignItems="start"
            padding={2}
            width="100%"
            maxWidth={isFullscreen ? "100%" : SIDENAV_WIDTH}
            height="100%"
            zIndex={1}
            backgroundColor="var(--chakra-colors-chakra-body-bg);"
        >
            <SideNavButton icon={AiOutlineHome} link="/" onClick={close}>
                For you
            </SideNavButton>
            <SideNavButton icon={AiOutlineFire} link="/popular" onClick={close}>
                Popular
            </SideNavButton>
            <SideNavButton
                icon={AiOutlineClockCircle}
                link="/latest"
                onClick={close}
            >
                Latest
            </SideNavButton>
            <Divider />
            <SideNavButton
                icon={RiUserReceivedLine}
                link="/following"
                onClick={close}
            >
                Following
            </SideNavButton>
            <SideNavButton
                icon={HiOutlineBookmark}
                link="/saved"
                onClick={close}
            >
                Saved
            </SideNavButton>
            <SideNavButton
                icon={AiOutlineHistory}
                link="/history"
                onClick={close}
            >
                History
            </SideNavButton>
            <SideNavButton
                icon={AiOutlinePlaySquare}
                link="/my_videos"
                onClick={close}
            >
                My videos
            </SideNavButton>
        </VStack>
    );
}

export default SideNav;
