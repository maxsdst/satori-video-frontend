import { AbsoluteCenter, Box, Icon, VStack } from "@chakra-ui/react";
import { AiOutlineComment, AiOutlineHeart } from "react-icons/ai";
import { BiVolumeFull, BiVolumeMute } from "react-icons/bi";
import { CiPause1 } from "react-icons/ci";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import PlayerButton from "./PlayerButton";

interface Props {
    isPlaying: boolean;
    onPause: () => void;
    onPlay: () => void;
    isMuted: boolean;
    onMute: () => void;
    onUnmute: () => void;
}

function PlayerControls({
    isPlaying,
    onPause,
    onPlay,
    isMuted,
    onMute,
    onUnmute,
}: Props) {
    return (
        <Box
            position="relative"
            width="100%"
            height="100%"
            zIndex={1}
            onClick={() => (isPlaying ? onPause() : onPlay())}
        >
            {!isPlaying && (
                <AbsoluteCenter verticalAlign="">
                    <Icon
                        as={CiPause1}
                        boxSize="50px"
                        filter="var(--player-drop-shadow)"
                        opacity={0.8}
                    />
                </AbsoluteCenter>
            )}
            <VStack
                position="absolute"
                top={0}
                right={0}
                height="100%"
                justifyContent="space-between"
            >
                <PlayerButton
                    icon={isMuted ? BiVolumeMute : BiVolumeFull}
                    onClick={isMuted ? onUnmute : onMute}
                />
                <VStack spacing={1}>
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
            </VStack>
        </Box>
    );
}

export default PlayerControls;
