import { Icon, MenuItem, MenuList, useToast } from "@chakra-ui/react";
import { AiOutlineDelete } from "react-icons/ai";
import Video from "../../entities/Video";
import useRemoveVideoFromSaved from "../../hooks/saved_videos/useRemoveVideoFromSaved";

interface Props {
    video: Video;
}

function ActionMenuList({ video }: Props) {
    const removeVideoFromSaved = useRemoveVideoFromSaved(video.id, {
        shouldInvalidateQueries: true,
    });

    const toast = useToast();

    return (
        <MenuList>
            <MenuItem
                icon={<Icon as={AiOutlineDelete} boxSize={5} />}
                onClick={(e) => {
                    e.preventDefault();
                    const mutation = removeVideoFromSaved.mutateAsync(null);
                    toast.promise(mutation, {
                        loading: {
                            description: "Removing video from saved...",
                        },
                        success: {
                            description: "Video removed from saved",
                        },
                        error: { description: "Something went wrong" },
                    });
                }}
            >
                Remove from saved
            </MenuItem>
        </MenuList>
    );
}

export default ActionMenuList;
