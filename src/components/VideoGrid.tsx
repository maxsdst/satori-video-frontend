import { SimpleGrid } from "@chakra-ui/react";
import VideoGridItem from "./VideoGridItem";

function VideoGrid() {
    return (
        <SimpleGrid
            columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            spacingX={4}
            spacingY={10}
        >
            <VideoGridItem></VideoGridItem>
            <VideoGridItem></VideoGridItem>
            <VideoGridItem></VideoGridItem>
            <VideoGridItem></VideoGridItem>
            <VideoGridItem></VideoGridItem>
            <VideoGridItem></VideoGridItem>
            <VideoGridItem></VideoGridItem>
            <VideoGridItem></VideoGridItem>
            <VideoGridItem></VideoGridItem>
            <VideoGridItem></VideoGridItem>
        </SimpleGrid>
    );
}

export default VideoGrid;
