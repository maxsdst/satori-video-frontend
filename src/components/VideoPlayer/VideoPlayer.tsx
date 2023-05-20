import ReactPlayer from "react-player/file";
import { Box } from "@chakra-ui/react";
import "./VideoPlayer.css";

interface Props {
    url: string;
}

function VideoPlayer({ url }: Props) {
    return (
        <Box className="player-wrapper">
            <ReactPlayer
                url={url}
                playing={true}
                muted={true}
                loop={true}
                width="100%"
                height="100%"
            />
        </Box>
    );
}

export default VideoPlayer;
