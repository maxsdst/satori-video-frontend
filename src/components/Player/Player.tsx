import { Box } from "@chakra-ui/react";
import { useState } from "react";
import ReactPlayer from "react-player/file";
import PlayerControls from "../PlayerControls";
import "./Player.css";

interface Props {
    url: string;
}

function Player({ url }: Props) {
    const [isPlaying, setPlaying] = useState(true);
    const [isMuted, setMuted] = useState(true);

    return (
        <Box className="player-wrapper">
            <PlayerControls
                isPlaying={isPlaying}
                onPause={() => setPlaying(false)}
                onPlay={() => setPlaying(true)}
                isMuted={isMuted}
                onMute={() => setMuted(true)}
                onUnmute={() => setMuted(false)}
            />
            <ReactPlayer
                url={url}
                playing={isPlaying}
                muted={isMuted}
                loop={true}
                width="100%"
                height="100%"
            />
        </Box>
    );
}

export default Player;
