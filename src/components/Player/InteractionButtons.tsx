import { VStack } from "@chakra-ui/react";
import { AiOutlineComment, AiOutlineHeart } from "react-icons/ai";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import PlayerButton from "./PlayerButton";

function InteractionButtons() {
    return (
        <VStack spacing={0}>
            <PlayerButton
                icon={AiOutlineHeart}
                onClick={() => console.log("like")}
            >
                12.8k
            </PlayerButton>
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
