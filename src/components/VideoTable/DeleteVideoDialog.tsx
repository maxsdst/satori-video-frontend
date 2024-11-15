import {
    Alert,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertIcon,
    AspectRatio,
    Box,
    Button,
    HStack,
    Img,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useRef } from "react";
import Video from "../../entities/Video";
import useDeleteVideo from "../../hooks/videos/useDeleteVideo";
import { convertDateToString, formatNumber } from "../../utils";

interface Props {
    video: Video;
    isOpen: boolean;
    onClose: () => void;
    onVideoDeleted: () => void;
}

function DeleteVideoDialog({ video, isOpen, onClose, onVideoDeleted }: Props) {
    const deleteVideo = useDeleteVideo(video.id);

    const cancelButton = useRef<HTMLButtonElement>(null);

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelButton}
            onClose={onClose}
            isCentered={true}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete this video forever?
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <VStack alignItems="start">
                            {deleteVideo.error && (
                                <Alert status="error">
                                    <AlertIcon />
                                    Something went wrong
                                </Alert>
                            )}
                            <HStack alignItems="start" spacing={0}>
                                <Box>
                                    <AspectRatio ratio={3 / 4} width="100px">
                                        <Img
                                            aria-label="Thumbnail"
                                            src={video.thumbnail}
                                            objectFit="cover"
                                        />
                                    </AspectRatio>
                                </Box>
                                <VStack
                                    alignItems="start"
                                    paddingX={4}
                                    paddingY={2}
                                    fontSize="sm"
                                    spacing={0}
                                >
                                    <Text
                                        aria-label="Title"
                                        noOfLines={1}
                                        whiteSpace="normal"
                                        width="100%"
                                        overflowWrap="anywhere"
                                    >
                                        {video.title}
                                    </Text>
                                    <Text
                                        aria-label="Upload date"
                                        color="gray.400"
                                    >
                                        Uploaded{" "}
                                        {convertDateToString(video.upload_date)}
                                    </Text>
                                    <Text
                                        aria-label="Number of views"
                                        color="gray.400"
                                    >
                                        {formatNumber(video.view_count)} views
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelButton} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={() =>
                                deleteVideo.mutate(null, {
                                    onSuccess: () => {
                                        onClose();
                                        onVideoDeleted();
                                    },
                                })
                            }
                            marginLeft={2}
                        >
                            Delete forever
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}

export default DeleteVideoDialog;
