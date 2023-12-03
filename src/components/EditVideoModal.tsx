import {
    Box,
    Button,
    Link as ChakraLink,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
    useBreakpointValue,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
    VIDEO_DESCRIPTION_MAX_LENGTH,
    VIDEO_TITLE_MAX_LENGTH,
} from "../constants";
import Video from "../entities/Video";
import Input from "../forms/Input";
import Textarea from "../forms/Textarea";
import useUpdateVideo from "../hooks/useUpdateVideo";
import Player from "./Player";

const schema = z.object({
    title: z
        .string()
        .nonempty("Title cannot be empty")
        .max(
            VIDEO_TITLE_MAX_LENGTH,
            `Title cannot be longer than ${VIDEO_TITLE_MAX_LENGTH} characters`
        ),
    description: z
        .string()
        .max(
            VIDEO_DESCRIPTION_MAX_LENGTH,
            `Description cannot be longer than ${VIDEO_DESCRIPTION_MAX_LENGTH} characters`
        ),
});

type FormData = z.infer<typeof schema>;

interface Props {
    video: Video;
    isOpen: boolean;
    onClose: () => void;
    onVideoEdited?: (video: Video) => void;
}

function EditVideoModal({ video, isOpen, onClose, onVideoEdited }: Props) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const updateVideo = useUpdateVideo(video.id, {
        onError: (data) => {
            if (data.title)
                setError("title", { message: data.title.join(" ") });
            if (data.description)
                setError("description", {
                    message: data.description.join(" "),
                });
        },
    });

    const playerHeight = "400px";
    const playerWidth = `calc(${playerHeight} / 16 * 9)`;

    const inputs = (
        <>
            <Input
                type="text"
                label="Title"
                inputProps={{
                    defaultValue: video.title,
                    ...register("title"),
                }}
                isInvalid={!!errors.title}
                errorMessage={errors.title?.message}
            />
            <Textarea
                label="Description"
                textareaProps={{
                    defaultValue: video.description,
                    ...register("description"),
                    rows: 6,
                }}
                isInvalid={!!errors.description}
                errorMessage={errors.description?.message}
            />
        </>
    );

    const player = (
        <Player
            videoId={video.id}
            showInteractionButtons={false}
            showVideoInfo={false}
            isPlaying={false}
            width={playerWidth}
            height={playerHeight}
            roundCorners={false}
        />
    );

    const bodyContent = useBreakpointValue<JSX.Element>({
        base: (
            <VStack alignItems="center" spacing={4}>
                {player}
                {inputs}
            </VStack>
        ),
        md: (
            <HStack spacing={8} width="100%" alignItems="start">
                <VStack alignItems="start" spacing={4} width="100%">
                    {inputs}
                </VStack>
                <Box>{player}</Box>
            </HStack>
        ),
    });

    const videoLink = `/videos/${video.id}`;

    return (
        <Modal
            size={{ base: "full", sm: "full", md: "4xl" }}
            isOpen={isOpen}
            onClose={onClose}
            closeOnOverlayClick={false}
        >
            <ModalOverlay />
            <ModalContent>
                <form
                    onSubmit={handleSubmit((data) => {
                        updateVideo.mutate(data, {
                            onSuccess: (video) => {
                                onVideoEdited?.(video);
                                onClose();
                            },
                        });
                    })}
                >
                    <ModalHeader>Edit video</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{bodyContent}</ModalBody>
                    <ModalFooter>
                        <HStack width="100%" justifyContent="space-between">
                            <VStack spacing={0} alignItems="start">
                                <Text fontSize="sm">Video link</Text>
                                <ChakraLink
                                    as={Link}
                                    to={videoLink}
                                    color="blue.200"
                                    fontSize="sm"
                                >
                                    {window.location.origin + videoLink}
                                </ChakraLink>
                            </VStack>
                            <Button
                                type="submit"
                                colorScheme="blue"
                                isDisabled={updateVideo.isLoading}
                            >
                                {updateVideo.isLoading ? "Saving..." : "Save"}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

export default EditVideoModal;
