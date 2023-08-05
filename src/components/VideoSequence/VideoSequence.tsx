import { Box } from "@chakra-ui/react";
import { useRef, useState } from "react";
import Video from "../../entities/Video";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { MAIN_CONTENT_AREA_PADDING, TOPNAV_HEIGHT } from "../../styleConstants";
import { isInPortraitMode } from "../../utils";
import Player from "../Player";
import VerticalSlider, { VerticalSliderHandle } from "../VerticalSlider";
import Navigation from "./Navigation";

interface Props {
    videos: Video[];
}

function VideoSequence({ videos }: Props) {
    const { width, height } = useWindowDimensions();

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const handleSlideChange = (slideIndex: number) =>
        setCurrentVideoIndex(slideIndex);

    const slider = useRef<VerticalSliderHandle>(null);

    if (isInPortraitMode(width, height))
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
                    spaceBetweenSlides="0"
                    onSlideChange={handleSlideChange}
                >
                    {videos.map((video, index) => (
                        <Player
                            key={video.id}
                            video={video}
                            isPlaying={currentVideoIndex === index}
                            width={`${width}px`}
                            height={`${height}px`}
                            roundCorners={false}
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
                    spaceBetweenSlides="24px"
                    onSlideChange={handleSlideChange}
                    ref={slider}
                >
                    {videos.map((video, index) => (
                        <Player
                            key={video.id}
                            video={video}
                            isPlaying={currentVideoIndex === index}
                            width={playerWidth}
                            height={playerHeight}
                            roundCorners={true}
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
