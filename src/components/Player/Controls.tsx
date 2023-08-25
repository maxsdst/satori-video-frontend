import { Box } from "@chakra-ui/react";
import { BsFillVolumeUpFill, BsVolumeMuteFill } from "react-icons/bs";
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
            <Box position="absolute" top={0} right={0}>
                <PlayerButton
                    icon={isMuted ? BsVolumeMuteFill : BsFillVolumeUpFill}
                    onClick={isMuted ? onUnmute : onMute}
                />
            </Box>
        </Box>
    );
}

export default PlayerControls;
