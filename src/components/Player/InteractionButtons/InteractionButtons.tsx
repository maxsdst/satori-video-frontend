import { VStack } from "@chakra-ui/react";
import { AiOutlineComment } from "react-icons/ai";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import Video from "../../../entities/Video";
import { formatNumber } from "../../../utils";
import PlayerButton from "../PlayerButton";
import LikeButton from "./LikeButton";

interface Props {
    video: Video;
    refetchVideo: () => void;
    openComments: () => void;
}

function InteractionButtons({ video, refetchVideo, openComments }: Props) {
    return (
        <VStack spacing={0}>
            <LikeButton video={video} refetchVideo={refetchVideo} />
            <PlayerButton icon={AiOutlineComment} onClick={openComments}>
                {formatNumber(video.comment_count)}
            </PlayerButton>
            <PlayerButton
                icon={HiOutlineDotsHorizontal}
                onClick={() => console.log("menu")}
            />
        </VStack>
    );
}

export default InteractionButtons;
