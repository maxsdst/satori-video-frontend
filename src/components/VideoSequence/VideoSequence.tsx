import { Box, useBoolean } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { VIEW_DURATION_THRESHOLD_SECONDS } from "../../constants";
import Video from "../../entities/Video";
import useCreateView from "../../hooks/useCreateView";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { MAIN_CONTENT_AREA_PADDING, TOPNAV_HEIGHT } from "../../styleConstants";
import { isInPortraitMode, isTouchDevice } from "../../utils";
import Player, { PlayerHandle } from "../Player";
import VerticalSlider, { VerticalSliderHandle } from "../VerticalSlider";
import Navigation from "./Navigation";

interface Props {
    videos: Video[];
}

function VideoSequence({ videos }: Props) {
    const { width, height } = useWindowDimensions();

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const slider = useRef<VerticalSliderHandle>(null);
    const [isSliderDisabled, { on: disableSlider, off: enableSlider }] =
        useBoolean(false);

    const players = useRef<(PlayerHandle | null)[]>([]);

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

    useEffect(() => {
        setIsViewCreated(false);
        players.current?.forEach((player) => player?.collapseContent());
    }, [currentVideoIndex]);

    const currentVideo = videos[currentVideoIndex];

    function handleSlideChange(slideIndex: number) {
        setCurrentVideoIndex(slideIndex);
    }

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
            >
                <VerticalSlider
                    isDraggable={isTouchDevice()}
                    spaceBetweenSlides="0"
                    onSlideChange={handleSlideChange}
                    isDisabled={isSliderDisabled}
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
                            width={`${width}px`}
                            height={`${height}px`}
                            roundCorners={false}
                            onProgress={handlePlayerProgress}
                            isFullscreen={true}
                            onContentExpanded={disableSlider}
                            onContentCollapsed={enableSlider}
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
                            width={playerWidth}
                            height={playerHeight}
                            minWidth="315px"
                            minHeight="560px"
                            roundCorners={true}
                            onProgress={handlePlayerProgress}
                            isFullscreen={false}
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

export default VideoSequence;
