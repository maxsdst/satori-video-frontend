import { AbsoluteCenter, Box, HStack, Icon, VStack } from "@chakra-ui/react";
import classNames from "classnames";
import {
    Ref,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useReducer,
    useRef,
    useState,
} from "react";
import { FaPlay } from "react-icons/fa";
import ReactPlayer from "react-player/file";
import useVideo from "../../hooks/videos/useVideo";
import { PLAYER_DROP_SHADOW } from "../../styleConstants";
import Comments from "./Comments";
import PlayerControls from "./Controls";
import Description from "./Description";
import InteractionButtons from "./InteractionButtons";
import "./Player.css";
import VideoInfo from "./VideoInfo";
import PlayerContext from "./playerContext";
import playerReducer from "./playerReducer";

interface Props {
    videoId: number;
    showInteractionButtons: boolean;
    showVideoInfo: boolean;
    isPlaying: boolean;
    width: string;
    height: string;
    minWidth?: string;
    minHeight?: string;
    isFullscreen: boolean;
    roundCorners: boolean;
    onProgress?: (secondsPlayed: number, percentPlayed: number) => void;
    onContentExpanded?: () => void;
    onContentCollapsed?: () => void;
}

export interface PlayerHandle {
    isContentExpanded: boolean;
    collapseContent: () => void;
}

const Player = forwardRef(
    (
        {
            videoId,
            showInteractionButtons,
            showVideoInfo,
            isPlaying: isPlayingProp,
            width,
            height,
            minWidth,
            minHeight,
            isFullscreen,
            roundCorners,
            onProgress,
            onContentExpanded,
            onContentCollapsed,
        }: Props,
        ref: Ref<PlayerHandle>
    ) => {
        const { data: video, isLoading, error } = useVideo(videoId);

        const [
            {
                isPlaying,
                isMuted,
                areCommentsOpen,
                isDescriptionOpen,
                isContentExpanded,
            },
            dispatch,
        ] = useReducer(playerReducer, {
            isPlaying: isPlayingProp,
            isMuted: true,
            areCommentsOpen: false,
            isDescriptionOpen: false,
            isContentExpanded: false,
        });

        const player = useRef<ReactPlayer>(null);

        useEffect(() => {
            if (isPlayingProp) {
                player.current?.setState({ showPreview: false });
                dispatch({ type: "PLAY" });
            } else {
                player.current?.setState({ showPreview: true });
                dispatch({ type: "PAUSE" });
            }
        }, [isPlayingProp]);

        useEffect(() => {
            if (isPlaying) player.current?.setState({ showPreview: false });
        }, [isPlaying]);

        const [duration, setDuration] = useState<number>();

        useEffect(() => {
            isContentExpanded ? onContentExpanded?.() : onContentCollapsed?.();
        }, [isContentExpanded]);

        useImperativeHandle(ref, () => ({
            isContentExpanded,
            collapseContent: () => dispatch({ type: "COLLAPSE_CONTENT" }),
        }));

        if (isLoading || !video) return null;
        if (error) throw error;

        const borderRadius = "6px";

        return (
            <PlayerContext.Provider
                value={{
                    width,
                    height,
                    minWidth,
                    minHeight,
                    isFullscreen,
                    borderRadius,
                }}
            >
                <HStack height={height} minHeight={minHeight} spacing={0}>
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
                        borderRadius={roundCorners ? borderRadius : undefined}
                        borderRightRadius={areCommentsOpen ? "0" : undefined}
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
                        <VStack
                            position="absolute"
                            width="100%"
                            height="100%"
                            spacing={0}
                        >
                            <Box
                                position="relative"
                                width="100%"
                                height="100%"
                                zIndex={3}
                            >
                                <PlayerControls
                                    isPlaying={isPlaying}
                                    onPause={() => dispatch({ type: "PAUSE" })}
                                    onPlay={() => dispatch({ type: "PLAY" })}
                                    isMuted={isMuted}
                                    onMute={() => dispatch({ type: "MUTE" })}
                                    onUnmute={() =>
                                        dispatch({ type: "UNMUTE" })
                                    }
                                />
                                <Box
                                    position="absolute"
                                    bottom={0}
                                    right={0}
                                    zIndex={2}
                                >
                                    {showInteractionButtons && (
                                        <InteractionButtons
                                            video={video}
                                            onOpenComments={() =>
                                                dispatch({
                                                    type: "OPEN_COMMENTS",
                                                })
                                            }
                                            onOpenDescription={() =>
                                                dispatch({
                                                    type: "OPEN_DESCRIPTION",
                                                })
                                            }
                                        />
                                    )}
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
                                duration && duration < 10
                                    ? (duration / 10) * 1000
                                    : 1000
                            }
                            onProgress={({ playedSeconds, played }) =>
                                onProgress?.(playedSeconds, played * 100)
                            }
                        />
                    </Box>
                    {areCommentsOpen && (
                        <Comments
                            video={video}
                            onClose={() =>
                                dispatch({ type: "COLLAPSE_CONTENT" })
                            }
                        />
                    )}
                    {isDescriptionOpen && (
                        <Description
                            video={video}
                            onClose={() =>
                                dispatch({ type: "COLLAPSE_CONTENT" })
                            }
                        />
                    )}
                </HStack>
            </PlayerContext.Provider>
        );
    }
);

export default Player;
