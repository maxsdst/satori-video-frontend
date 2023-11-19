import {
    AbsoluteCenter,
    Box,
    Icon,
    VStack,
    useBoolean,
} from "@chakra-ui/react";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import ReactPlayer from "react-player/file";
import Video from "../../entities/Video";
import { PLAYER_DROP_SHADOW } from "../../styleConstants";
import PlayerControls from "./Controls";
import InteractionButtons from "./InteractionButtons";
import "./Player.css";
import VideoInfo from "./VideoInfo";

interface Props {
    video: Video;
    showInteractionButtons: boolean;
    showVideoInfo: boolean;
    isPlaying: boolean;
    width: string;
    height: string;
    minWidth?: string;
    minHeight?: string;
    roundCorners: boolean;
    onProgress?: (secondsPlayed: number, percentPlayed: number) => void;
}

function Player({
    video,
    showInteractionButtons,
    showVideoInfo,
    isPlaying: isPlayingProp,
    width,
    height,
    minWidth,
    minHeight,
    roundCorners,
    onProgress,
}: Props) {
    const player = useRef<ReactPlayer>(null);

    const [isPlaying, { on: play, off: pause }] = useBoolean(isPlayingProp);
    const [isMuted, { on: mute, off: unmute }] = useBoolean(true);

    useEffect(() => {
        if (isPlayingProp) {
            player.current?.setState({ showPreview: false });
            play();
        } else {
            player.current?.setState({ showPreview: true });
            pause();
        }
    }, [isPlayingProp]);

    useEffect(() => {
        if (isPlaying) player.current?.setState({ showPreview: false });
    }, [isPlaying]);

    const [duration, setDuration] = useState<number>();

    return (
        <Box
            className={classNames({
                "player-wrapper": true,
                "video-round-corners": roundCorners,
            })}
            width={width}
            height={height}
            minWidth={minWidth}
            minHeight={minHeight}
            position="relative"
            overflow="hidden"
            backgroundImage={video.first_frame}
            backgroundSize="cover"
            backgroundPosition="center"
            borderRadius={roundCorners ? "6px" : undefined}
        >
            {!isPlaying && (
                <AbsoluteCenter verticalAlign="">
                    <Icon
                        as={FaPlay}
                        boxSize="40px"
                        filter={PLAYER_DROP_SHADOW}
                        opacity={0.8}
                    />
                </AbsoluteCenter>
            )}
            <VStack position="absolute" width="100%" height="100%" spacing={0}>
                <Box position="relative" width="100%" height="100%">
                    <PlayerControls
                        isPlaying={isPlaying}
                        onPause={pause}
                        onPlay={play}
                        isMuted={isMuted}
                        onMute={mute}
                        onUnmute={unmute}
                    />
                    <Box position="absolute" bottom={0} right={0} zIndex={2}>
                        {showInteractionButtons && <InteractionButtons />}
                    </Box>
                </Box>
                {showVideoInfo && <VideoInfo video={video} />}
            </VStack>
            <ReactPlayer
                url={video.source}
                playing={isPlaying}
                muted={isMuted}
                loop={true}
                width="100%"
                height="100%"
                playsinline={true}
                light={video.first_frame}
                playIcon={<></>}
                ref={player}
                onDuration={(duration) => setDuration(duration)}
                progressInterval={
                    duration && duration < 10 ? (duration / 10) * 1000 : 1000
                }
                onProgress={({ playedSeconds, played }) =>
                    onProgress?.(playedSeconds, played * 100)
                }
            />
        </Box>
    );
}

export default Player;
