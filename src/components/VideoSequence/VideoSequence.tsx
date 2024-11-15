import { Box, Image, useBoolean } from "@chakra-ui/react";
import {
    Ref,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { VIEW_DURATION_THRESHOLD_SECONDS } from "../../constants";
import Video from "../../entities/Video";
import useCreateEvent, { EventType } from "../../hooks/events/useCreateEvent";
import useTitle from "../../hooks/useTitle";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import useCreateView from "../../hooks/views/useCreateView";
import {
    MAIN_CONTENT_AREA_PADDING,
    PLAYER_DROP_SHADOW,
    TOPNAV_HEIGHT,
} from "../../styleConstants";
import { isInPortraitMode, isTouchDevice } from "../../utils";
import Player, { PlayerHandle } from "../Player";
import VerticalSlider, { VerticalSliderHandle } from "../VerticalSlider";
import Navigation from "./Navigation";

interface Props {
    videos: Video[];
    initialVideoIndex?: number;
    onFetchMore: () => void;
    highlightedCommentId?: number;
    highlightedCommentParentId?: number;
}

export interface VideoSequenceHandle {
    reset: () => void;
}

const VideoSequence = forwardRef(
    (
        {
            videos,
            initialVideoIndex,
            onFetchMore,
            highlightedCommentId,
            highlightedCommentParentId,
        }: Props,
        ref: Ref<VideoSequenceHandle>
    ) => {
        useEffect(() => {
            if (videos.length === 0) onFetchMore();
        }, [videos]);

        const fetchThresholdSlidesFromEnd = 2;

        const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

        useTitle(videos[currentVideoIndex].title);

        const navigate = useNavigate();

        const { width, height } = useWindowDimensions();

        const slider = useRef<VerticalSliderHandle>(null);
        const [isSliderDisabled, { on: disableSlider, off: enableSlider }] =
            useBoolean(false);

        const players = useRef<(PlayerHandle | null)[]>([]);

        const [arePlayersMuted, setPlayersMuted] = useState(true);

        const isFullscreen = isInPortraitMode(width, height);

        useEffect(() => {
            if (!isFullscreen) enableSlider();
            if (
                isFullscreen &&
                players.current?.[currentVideoIndex]?.isContentExpanded
            )
                disableSlider();
        }, [isFullscreen]);

        const createView = useCreateView({});
        const [isViewCreated, setIsViewCreated] = useState(false);

        const createEvent = useCreateEvent({});

        useEffect(() => {
            setIsViewCreated(false);
            players.current?.forEach(
                (player, index) =>
                    index !== currentVideoIndex && player?.collapseContent()
            );
        }, [currentVideoIndex]);

        useImperativeHandle(ref, () => ({
            reset() {
                slider.current?.reset();
                setCurrentVideoIndex(0);
                setIsViewCreated(false);
            },
        }));

        const currentVideo = videos[currentVideoIndex];

        function handlePlayerProgress(
            secondsPlayed: number,
            percentPlayed: number
        ) {
            if (isViewCreated) return;
            if (
                secondsPlayed > VIEW_DURATION_THRESHOLD_SECONDS ||
                percentPlayed > 50
            ) {
                createView.mutate({ videoId: currentVideo.id });
                setIsViewCreated(true);
            }
        }

        function handleSlideChange(slideIndex: number) {
            navigate("/videos/" + videos[slideIndex].id, { replace: true });

            setCurrentVideoIndex(slideIndex);

            if (videos.length - slideIndex <= fetchThresholdSlidesFromEnd)
                onFetchMore();

            createEvent.mutate({
                videoId: videos[slideIndex].id,
                type: EventType.VIEW,
            });
        }

        if (isFullscreen)
            return (
                <Box
                    position="fixed"
                    width="100%"
                    height="100%"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    paddingBottom={0}
                    overflow="hidden"
                    backgroundColor="black"
                    zIndex={2}
                >
                    <Link to="/">
                        <Image
                            src="/logo.svg"
                            boxSize={10}
                            position="absolute"
                            top={2}
                            left={2}
                            zIndex={1}
                            filter={`invert(100%); ${PLAYER_DROP_SHADOW}`}
                        />
                    </Link>
                    <VerticalSlider
                        isDraggable={isTouchDevice()}
                        spaceBetweenSlides="0"
                        onSlideChange={handleSlideChange}
                        isDisabled={isSliderDisabled}
                        initialSlideIndex={initialVideoIndex}
                    >
                        {videos.map((video, index) => (
                            <Player
                                key={video.id}
                                ref={(player) => {
                                    if (players.current)
                                        players.current[index] = player;
                                }}
                                videoId={video.id}
                                showInteractionButtons={true}
                                showVideoInfo={true}
                                isPlaying={currentVideoIndex === index}
                                isMuted={arePlayersMuted}
                                onMuteStateChange={setPlayersMuted}
                                width={`${width}px`}
                                height={`${height}px`}
                                roundCorners={false}
                                onProgress={handlePlayerProgress}
                                isFullscreen={true}
                                onContentExpanded={disableSlider}
                                onContentCollapsed={enableSlider}
                                highlightedCommentId={
                                    index === 0
                                        ? highlightedCommentId
                                        : undefined
                                }
                                highlightedCommentParentId={
                                    index === 0
                                        ? highlightedCommentParentId
                                        : undefined
                                }
                            />
                        ))}
                    </VerticalSlider>
                </Box>
            );
        else {
            const availableArea = `calc(100vh - ${TOPNAV_HEIGHT} - ${MAIN_CONTENT_AREA_PADDING})`;
            const playerHeight = `calc(${availableArea} - 50px)`;
            const playerWidth = `calc(${playerHeight} / 16 * 9)`;

            return (
                <Box position="relative" width="100%" height={availableArea}>
                    <VerticalSlider
                        isDraggable={isTouchDevice()}
                        spaceBetweenSlides="24px"
                        onSlideChange={handleSlideChange}
                        ref={slider}
                        isDisabled={false}
                        initialSlideIndex={initialVideoIndex}
                    >
                        {videos.map((video, index) => (
                            <Player
                                key={video.id}
                                ref={(player) => {
                                    if (players.current)
                                        players.current[index] = player;
                                }}
                                videoId={video.id}
                                showInteractionButtons={true}
                                showVideoInfo={true}
                                isPlaying={currentVideoIndex === index}
                                isMuted={arePlayersMuted}
                                onMuteStateChange={setPlayersMuted}
                                width={playerWidth}
                                height={playerHeight}
                                minWidth="315px"
                                minHeight="560px"
                                roundCorners={true}
                                onProgress={handlePlayerProgress}
                                isFullscreen={false}
                                highlightedCommentId={
                                    index === 0
                                        ? highlightedCommentId
                                        : undefined
                                }
                                highlightedCommentParentId={
                                    index === 0
                                        ? highlightedCommentParentId
                                        : undefined
                                }
                            />
                        ))}
                    </VerticalSlider>
                    <Navigation
                        showUp={currentVideoIndex !== 0}
                        showDown={currentVideoIndex < videos.length - 1}
                        onUp={() => slider.current?.goToPrev()}
                        onDown={() => slider.current?.goToNext()}
                    />
                </Box>
            );
        }
    }
);

export default VideoSequence;
