import { Box } from "@chakra-ui/react";
import { useState } from "react";
import Video from "../entities/Video";
import { useWindowDimensions } from "../hooks/useWindowDimensions";
import { MAIN_CONTENT_AREA_PADDING, TOPNAV_HEIGHT } from "../styleConstants";
import { isInPortraitMode } from "../utils";
import Player from "./Player";
import VerticalSlider from "./VerticalSlider";

interface Props {
    videos: Video[];
}

function VideoSequence({ videos }: Props) {
    const { width, height } = useWindowDimensions();

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const handleSlideChange = (slideIndex: number) =>
        setCurrentVideoIndex(slideIndex);

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
            <Box position="relative" height={availableArea}>
                <VerticalSlider
                    spaceBetweenSlides="24px"
                    onSlideChange={handleSlideChange}
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
            </Box>
        );
    }
}

export default VideoSequence;
