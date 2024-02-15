import { VStack } from "@chakra-ui/react";
import { AiOutlineComment } from "react-icons/ai";
import Video from "../../../entities/Video";
import { formatNumber } from "../../../utils";
import PlayerButton from "../PlayerButton";
import LikeButton from "./LikeButton";
import MoreActionsMenu from "./MoreActionsMenu";

interface Props {
    video: Video;
    refetchVideo: () => void;
    openComments: () => void;
}

function InteractionButtons({ video, refetchVideo, openComments }: Props) {
    return (
        <VStack spacing={0} zIndex={4}>
            <LikeButton video={video} refetchVideo={refetchVideo} />
            <PlayerButton icon={AiOutlineComment} onClick={openComments}>
                {formatNumber(video.comment_count)}
            </PlayerButton>
            <MoreActionsMenu />
        </VStack>
    );
}

export default InteractionButtons;
