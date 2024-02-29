import {
    Icon,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Portal,
    useDisclosure,
} from "@chakra-ui/react";
import { AiOutlineFlag } from "react-icons/ai";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { HiBookmark, HiOutlineBookmark } from "react-icons/hi2";
import { PiTextAlignLeftFill } from "react-icons/pi";
import { TbShare3 } from "react-icons/tb";
import Video from "../../../entities/Video";
import useCreateSavedVideo from "../../../hooks/useCreateSavedVideo";
import useRemoveVideoFromSaved from "../../../hooks/useRemoveVideoFromSaved";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import { isInPortraitMode } from "../../../utils";
import PlayerButton from "../PlayerButton";
import ShareModal from "../ShareModal";

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

    const createSavedVideo = useCreateSavedVideo(video.id, {
        shouldUpdateVideoOptimistically: true,
    });
    const removeVideoFromSaved = useRemoveVideoFromSaved(video.id, {
        shouldUpdateVideoOptimistically: true,
    });

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
                onClick={openShareModal}
            >
                Share
            </MenuItem>
            <MenuItem
                {...menuItemStyles}
                icon={
                    <Icon
                        as={video.is_saved ? HiBookmark : HiOutlineBookmark}
                        boxSize={5}
                    />
                }
                closeOnSelect={false}
                onClick={() =>
                    video.is_saved
                        ? removeVideoFromSaved.mutate(null)
                        : createSavedVideo.mutate(null)
                }
            >
                {video.is_saved ? "Saved" : "Save"}
            </MenuItem>
            <MenuItem
                {...menuItemStyles}
                icon={<Icon as={AiOutlineFlag} boxSize={5} />}
            >
                Report
            </MenuItem>
        </>
    );

    const menuMarginX = "8px";

    return (
        <>
            <Menu>
                <MenuButton as={PlayerButton} icon={HiOutlineDotsVertical} />
                {isFullscreen && (
                    <Portal>
                        <MenuList
                            position="fixed"
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
                    <MenuList position="fixed">{menuItems}</MenuList>
                )}
            </Menu>
            <ShareModal
                video={video}
                isOpen={isShareModalOpen}
                onClose={closeShareModal}
            />
        </>
    );
}

export default MoreActionsMenu;
