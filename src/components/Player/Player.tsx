import { Box, VStack, useBoolean } from "@chakra-ui/react";
import ReactPlayer from "react-player/file";
import Video from "../../entities/Video";
import "./Player.css";
import PlayerControls from "./PlayerControls";
import PlayerInfo from "./PlayerInfo";

interface Props {
    video: Video;
}

function Player({ video }: Props) {
    const [isPlaying, { on: play, off: pause }] = useBoolean(true);
    const [isMuted, { on: mute, off: unmute }] = useBoolean(true);

    return (
        <Box className="player-wrapper">
            <VStack position="absolute" width="100%" height="100%" spacing={0}>
                <PlayerControls
                    isPlaying={isPlaying}
                    onPause={pause}
                    onPlay={play}
                    isMuted={isMuted}
                    onMute={mute}
                    onUnmute={unmute}
                />
                <PlayerInfo video={video} />
            </VStack>
            <ReactPlayer
                url={video.source}
                playing={isPlaying}
                muted={isMuted}
                loop={true}
                width="100%"
                height="100%"
                playsinline={true}
            />
        </Box>
    );
}

export default Player;
