import {
    AbsoluteCenter,
    Box,
    HStack,
    Icon,
    Skeleton,
    VStack,
} from "@chakra-ui/react";
import classNames from "classnames";
import {
    Ref,
    forwardRef,
    useContext,
    useEffect,
    useImperativeHandle,
    useReducer,
    useRef,
    useState,
} from "react";
import { FaPlay } from "react-icons/fa";
import ReactPlayer from "react-player/file";
import { useUpdateEffect } from "react-use";
import useVideo from "../../hooks/videos/useVideo";
import VideoPageContext from "../../pages/VideoPage/VideoPageContext";
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
    isMuted: boolean;
    onMuteStateChange?: (isMuted: boolean) => void;
    width: string;
    height: string;
    minWidth?: string;
    minHeight?: string;
    isFullscreen: boolean;
    roundCorners: boolean;
    onProgress?: (secondsPlayed: number, percentPlayed: number) => void;
    onContentExpanded?: () => void;
    onContentCollapsed?: () => void;
    highlightedCommentId?: number;
    highlightedCommentParentId?: number;
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
            isMuted: isMutedProp,
            onMuteStateChange,
            width,
            height,
            minWidth,
            minHeight,
            isFullscreen,
            roundCorners,
            onProgress,
            onContentExpanded,
            onContentCollapsed,
            highlightedCommentId,
            highlightedCommentParentId,
        }: Props,
        ref: Ref<PlayerHandle>
    ) => {
        const { fetchedVideos } = useContext(VideoPageContext);

        const {
            data: video,
            isLoading,
            error,
        } = useVideo(videoId, {
            initialData: fetchedVideos?.find((video) => video.id === videoId),
            staleTime: Infinity,
        });

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
            isMuted: isMutedProp,
            areCommentsOpen: !!highlightedCommentId,
            isDescriptionOpen: false,
            isContentExpanded: !!highlightedCommentId,
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
        }, [isPlayingProp, video]);

        useEffect(() => {
            if (isPlaying) player.current?.setState({ showPreview: false });
        }, [isPlaying]);

        useEffect(() => {
            if (isMutedProp) dispatch({ type: "MUTE" });
            else dispatch({ type: "UNMUTE" });
        }, [isMutedProp]);

        useUpdateEffect(() => {
            onMuteStateChange?.(isMuted);
        }, [isMuted, onMuteStateChange]);

        const [duration, setDuration] = useState<number>();

        useUpdateEffect(() => {
            isContentExpanded ? onContentExpanded?.() : onContentCollapsed?.();
        }, [isContentExpanded, onContentExpanded, onContentCollapsed]);

        useImperativeHandle(ref, () => ({
            isContentExpanded,
            collapseContent: () => dispatch({ type: "COLLAPSE_CONTENT" }),
        }));

        const borderRadius = "6px";

        if (isLoading || !video)
            return (
                <Skeleton
                    width={width}
                    height={height}
                    minHeight={minHeight}
                    borderRadius={!isFullscreen ? borderRadius : undefined}
                    role="progressbar"
                    aria-label="Loading video"
                />
            );
        if (error) throw error;

        return (
            <PlayerContext.Provider
                value={{
                    width,
                    height,
                    minWidth,
                    minHeight,
                    isFullscreen,
                    borderRadius,
                    highlightedCommentId,
                    highlightedCommentParentId,
                }}
            >
                <HStack
                    data-testid="player"
                    height={height}
                    minHeight={minHeight}
                    spacing={0}
                >
                    <Box
                        data-testid="player-wrapper"
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
                            config={{ attributes: { "data-testid": "video" } }}
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
                                    : 500
                            }
                            onProgress={({ playedSeconds, played }) => {
                                onProgress?.(playedSeconds, played * 100);
                            }}
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
