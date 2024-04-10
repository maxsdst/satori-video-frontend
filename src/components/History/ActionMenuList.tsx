import { Icon, MenuItem, MenuList, useToast } from "@chakra-ui/react";
import { AiOutlineDelete } from "react-icons/ai";
import Video from "../../entities/Video";
import useRemoveVideoFromHistory from "../../hooks/history/useRemoveVideoFromHistory";

interface Props {
    video: Video;
}

function ActionMenuList({ video }: Props) {
    const removeVideoFromHistory = useRemoveVideoFromHistory(video.id);

    const toast = useToast();

    return (
        <MenuList>
            <MenuItem
                icon={<Icon as={AiOutlineDelete} boxSize={5} />}
                onClick={(e) => {
                    e.preventDefault();
                    const mutation = removeVideoFromHistory.mutateAsync(null);
                    toast.promise(mutation, {
                        loading: {
                            description: "Removing video from history...",
                        },
                        success: {
                            description:
                                "All views of this video removed from history",
                        },
                        error: { description: "Something went wrong" },
                    });
                }}
            >
                Remove from watch history
            </MenuItem>
        </MenuList>
    );
}

export default ActionMenuList;
