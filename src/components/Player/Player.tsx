import {
    AbsoluteCenter,
    Box,
    HStack,
    Icon,
    VStack,
    useBoolean,
    useDisclosure,
} from "@chakra-ui/react";
import classNames from "classnames";
import {
    Ref,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { FaPlay } from "react-icons/fa";
import ReactPlayer from "react-player/file";
import useVideo from "../../hooks/useVideo";
import { PLAYER_DROP_SHADOW } from "../../styleConstants";
import Comments from "./Comments";
import PlayerControls from "./Controls";
import InteractionButtons from "./InteractionButtons";
import "./Player.css";
import VideoInfo from "./VideoInfo";

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
    onCommentsOpened?: () => void;
    onCommentsClosed?: () => void;
}

export interface PlayerHandle {
    areCommentsOpen: boolean;
    closeComments: () => void;
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
            onCommentsOpened,
            onCommentsClosed,
        }: Props,
        ref: Ref<PlayerHandle>
    ) => {
        const { data: video, isLoading, refetch, error } = useVideo(videoId);

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

        const {
            isOpen: areCommentsOpen,
            onOpen: openComments,
            onClose: closeComments,
        } = useDisclosure();

        useImperativeHandle(ref, () => ({ areCommentsOpen, closeComments }));

        if (isLoading || !video) return null;
        if (error) throw error;

        const borderRadius = "6px";

        return (
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
                                onPause={pause}
                                onPlay={play}
                                isMuted={isMuted}
                                onMute={mute}
                                onUnmute={unmute}
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
                                        refetchVideo={refetch}
                                        openComments={() => {
                                            openComments();
                                            onCommentsOpened?.();
                                        }}
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
                        onClose={() => {
                            closeComments();
                            onCommentsClosed?.();
                        }}
                        width={isFullscreen ? width : "450px"}
                        height={height}
                        minHeight={minHeight}
                        isFullscreen={isFullscreen}
                        borderRadius={borderRadius}
                    />
                )}
            </HStack>
        );
    }
);

export default Player;
