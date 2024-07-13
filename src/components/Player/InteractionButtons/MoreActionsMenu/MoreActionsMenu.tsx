import {
    Icon,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    MenuListProps,
    Portal,
    useDisclosure,
} from "@chakra-ui/react";
import { AiOutlineFlag } from "react-icons/ai";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { HiBookmark, HiOutlineBookmark } from "react-icons/hi2";
import { PiTextAlignLeftFill } from "react-icons/pi";
import { TbShare3 } from "react-icons/tb";
import Video from "../../../../entities/Video";
import useCreateEvent, {
    EventType,
} from "../../../../hooks/events/useCreateEvent";
import useOwnProfile from "../../../../hooks/profiles/useOwnProfile";
import useCreateSavedVideo from "../../../../hooks/saved_videos/useCreateSavedVideo";
import useRemoveVideoFromSaved from "../../../../hooks/saved_videos/useRemoveVideoFromSaved";
import { useWindowDimensions } from "../../../../hooks/useWindowDimensions";
import { isInPortraitMode } from "../../../../utils";
import PlayerButton from "../../PlayerButton";
import ReportModal from "./ReportModal";
import ShareModal from "./ShareModal";

interface Props {
    video: Video;
    onOpenDescription: () => void;
}

function MoreActionsMenu({ video, onOpenDescription }: Props) {
    const { width, height } = useWindowDimensions();
    const isFullscreen = isInPortraitMode(width, height);

    const {
        isOpen: isShareModalOpen,
        onOpen: openShareModal,
        onClose: closeShareModal,
    } = useDisclosure();

    const { data: ownProfile, isLoading, error } = useOwnProfile();

    const createSavedVideo = useCreateSavedVideo(video.id, {
        shouldUpdateVideoOptimistically: true,
    });
    const removeVideoFromSaved = useRemoveVideoFromSaved(video.id, {
        shouldUpdateVideoOptimistically: true,
    });

    const {
        isOpen: isReportModalOpen,
        onOpen: openReportModal,
        onClose: closeReportModal,
    } = useDisclosure();

    const createEvent = useCreateEvent({});

    if (isLoading || error) return null;

    const menuItemStyles = isFullscreen
        ? {
              paddingX: 4,
              paddingY: 3,
          }
        : {};

    const menuItems = (
        <>
            <MenuItem
                {...menuItemStyles}
                icon={<Icon as={PiTextAlignLeftFill} boxSize={5} />}
                onClick={onOpenDescription}
            >
                Description
            </MenuItem>
            <MenuItem
                {...menuItemStyles}
                icon={<Icon as={TbShare3} boxSize={5} />}
                onClick={() => {
                    openShareModal();
                    createEvent.mutate({
                        videoId: video.id,
                        type: EventType.SHARE,
                    });
                }}
            >
                Share
            </MenuItem>
            {ownProfile && (
                <MenuItem
                    {...menuItemStyles}
                    icon={
                        <Icon
                            as={video.is_saved ? HiBookmark : HiOutlineBookmark}
                            boxSize={5}
                        />
                    }
                    closeOnSelect={false}
                    onClick={() => {
                        if (video.is_saved) {
                            removeVideoFromSaved.mutate(null);
                        } else {
                            createSavedVideo.mutate(null);
                            createEvent.mutate({
                                videoId: video.id,
                                type: EventType.SAVE,
                            });
                        }
                    }}
                >
                    {video.is_saved ? "Saved" : "Save"}
                </MenuItem>
            )}
            <MenuItem
                {...menuItemStyles}
                icon={<Icon as={AiOutlineFlag} boxSize={5} />}
                onClick={openReportModal}
            >
                Report
            </MenuItem>
        </>
    );

    const menuMarginX = "8px";

    const menuListProps: MenuListProps = {
        "aria-label": "More actions menu",
        position: "fixed",
        zIndex: 10,
    };

    return (
        <>
            <Menu>
                <MenuButton
                    as={PlayerButton}
                    ariaLabel="More actions"
                    icon={HiOutlineDotsVertical}
                />
                {isFullscreen && (
                    <Portal>
                        <MenuList
                            {...menuListProps}
                            width={`calc(100% - (${menuMarginX} * 2))`}
                            marginX={menuMarginX}
                            marginBottom="24px"
                            bottom={0}
                            borderRadius="12px"
                        >
                            {menuItems}
                        </MenuList>
                    </Portal>
                )}
                {!isFullscreen && (
                    <MenuList {...menuListProps}>{menuItems}</MenuList>
                )}
            </Menu>
            <ShareModal
                video={video}
                isOpen={isShareModalOpen}
                onClose={closeShareModal}
            />
            <ReportModal
                video={video}
                isOpen={isReportModalOpen}
                onClose={closeReportModal}
            />
        </>
    );
}

export default MoreActionsMenu;
