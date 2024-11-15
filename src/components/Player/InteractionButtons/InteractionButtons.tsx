import { VStack } from "@chakra-ui/react";
import { AiOutlineComment } from "react-icons/ai";
import Video from "../../../entities/Video";
import { formatNumber } from "../../../utils";
import PlayerButton from "../PlayerButton";
import LikeButton from "./LikeButton";
import MoreActionsMenu from "./MoreActionsMenu";

interface Props {
    video: Video;
    onOpenComments: () => void;
    onOpenDescription: () => void;
}

function InteractionButtons({
    video,
    onOpenComments,
    onOpenDescription,
}: Props) {
    return (
        <VStack spacing={0} zIndex={4}>
            <LikeButton video={video} />
            <PlayerButton
                ariaLabel="Comments"
                icon={AiOutlineComment}
                onClick={onOpenComments}
            >
                {formatNumber(video.comment_count)}
            </PlayerButton>
            <MoreActionsMenu
                video={video}
                onOpenDescription={onOpenDescription}
            />
        </VStack>
    );
}

export default InteractionButtons;
