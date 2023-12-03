import { VStack } from "@chakra-ui/react";
import { AiOutlineComment } from "react-icons/ai";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import Video from "../../../entities/Video";
import PlayerButton from "../PlayerButton";
import LikeButton from "./LikeButton";

interface Props {
    video: Video;
    refetchVideo: () => void;
}

function InteractionButtons({ video, refetchVideo }: Props) {
    return (
        <VStack spacing={0}>
            <LikeButton video={video} refetchVideo={refetchVideo} />
            <PlayerButton
                icon={AiOutlineComment}
                onClick={() => console.log("comment")}
            >
                1431
            </PlayerButton>
            <PlayerButton
                icon={HiOutlineDotsHorizontal}
                onClick={() => console.log("menu")}
            />
        </VStack>
    );
}

export default InteractionButtons;
