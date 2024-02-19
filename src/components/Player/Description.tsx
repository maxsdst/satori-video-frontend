import { Avatar, Box, Divider, HStack, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Video from "../../entities/Video";
import { formatNumber, getShortenedMonth } from "../../utils";
import AdaptivePanel from "./AdaptivePanel";

interface Props {
    video: Video;
    onClose: () => void;
}

function Description({ video, onClose }: Props) {
    return (
        <AdaptivePanel
            onClose={onClose}
            header={
                <HStack height="100%">
                    <Text fontSize="lg" fontWeight="semibold">
                        Description
                    </Text>
                </HStack>
            }
        >
            <Divider orientation="horizontal" />
            <VStack
                alignItems="start"
                padding={5}
                width="100%"
                height="100%"
                overflowY="auto"
                spacing={4}
            >
                <Text
                    fontSize="lg"
                    fontWeight="semibold"
                    overflowWrap="anywhere"
                >
                    {video.title}
                </Text>
                <Link to={"/users/" + video.profile.user.username}>
                    <HStack>
                        <Avatar
                            size="sm"
                            src={video.profile.avatar || undefined}
                        />
                        <Text fontSize="sm" fontWeight="semibold">
                            {video.profile.user.username}
                        </Text>
                    </HStack>
                </Link>
                <HStack width="100%" justifyContent="space-evenly">
                    <VStack spacing={0}>
                        <Text fontSize="lg" fontWeight="semibold">
                            {formatNumber(video.like_count)}
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                            Likes
                        </Text>
                    </VStack>
                    <VStack spacing={0}>
                        <Text fontSize="lg" fontWeight="semibold">
                            {formatNumber(video.view_count)}
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                            Views
                        </Text>
                    </VStack>
                    <VStack spacing={0}>
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                        >{`${getShortenedMonth(
                            video.upload_date
                        )} ${video.upload_date.getDate()}`}</Text>
                        <Text fontSize="xs" opacity={0.8}>
                            {video.upload_date.getFullYear()}
                        </Text>
                    </VStack>
                </HStack>
                {video.description && (
                    <Box
                        backgroundColor="gray.800"
                        padding={3}
                        borderRadius="12px"
                    >
                        <Text
                            fontSize="sm"
                            opacity={0.9}
                            wordBreak="break-word"
                            whiteSpace="pre-line"
                        >
                            {video.description}
                        </Text>
                    </Box>
                )}
            </VStack>
        </AdaptivePanel>
    );
}

export default Description;
