import {
    AspectRatio,
    Box,
    HStack,
    Img,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import {
    AiOutlineDelete,
    AiOutlineEdit,
    AiOutlinePlayCircle,
} from "react-icons/ai";
import Video from "../../entities/Video";
import EditVideoModal from "../EditVideoModal";
import IconButton from "../IconButton";
import DeleteVideoDialog from "./DeleteVideoDialog";

interface Props {
    video: Video;
    onVideoMutated: () => void;
}

function VideoCell({ video, onVideoMutated }: Props) {
    const {
        isOpen: isEditVideoModalOpen,
        onOpen: openEditVideoModal,
        onClose: closeEditVideoModal,
    } = useDisclosure();

    const {
        isOpen: isDeleteVideoDialogOpen,
        onOpen: openDeleteVideoDialog,
        onClose: closeDeleteVideoDialog,
    } = useDisclosure();

    return (
        <>
            <HStack spacing={0} alignItems="start" minWidth="210px">
                <Box>
                    <AspectRatio ratio={3 / 4} width="60px">
                        <Img
                            aria-label="Thumbnail"
                            src={video.thumbnail}
                            objectFit="cover"
                            _hover={{ cursor: "pointer" }}
                            onClick={openEditVideoModal}
                        />
                    </AspectRatio>
                </Box>
                <VStack
                    width={["150px", "200px", "250px", "300px"]}
                    paddingX={4}
                    paddingY={2}
                    alignItems="start"
                    spacing={1}
                    lineHeight="normal"
                >
                    <Text
                        aria-label="Title"
                        _hover={{
                            cursor: "pointer",
                            textDecoration: "underline",
                        }}
                        onClick={openEditVideoModal}
                        noOfLines={1}
                        whiteSpace="normal"
                        width="100%"
                        overflowWrap="anywhere"
                    >
                        {video.title}
                    </Text>
                    <Text
                        aria-label="Description"
                        className="videotable-description"
                        color={video.description ? "gray.400" : "gray.500"}
                        noOfLines={2}
                        whiteSpace="normal"
                        width="100%"
                        overflowWrap="anywhere"
                    >
                        {video.description || "Add description"}
                    </Text>
                    <HStack className="videotable-action-buttons">
                        <IconButton
                            icon={AiOutlineEdit}
                            size="sm"
                            label="Edit"
                            onClick={openEditVideoModal}
                        />
                        <IconButton
                            icon={AiOutlinePlayCircle}
                            size="sm"
                            label="View"
                            link={"/videos/" + video.id}
                        />
                        <IconButton
                            icon={AiOutlineDelete}
                            size="sm"
                            label="Delete"
                            onClick={openDeleteVideoDialog}
                        />
                    </HStack>
                </VStack>
            </HStack>
            <EditVideoModal
                video={video}
                isOpen={isEditVideoModalOpen}
                onClose={closeEditVideoModal}
                onVideoEdited={onVideoMutated}
            />
            <DeleteVideoDialog
                video={video}
                isOpen={isDeleteVideoDialogOpen}
                onClose={closeDeleteVideoDialog}
                onVideoDeleted={onVideoMutated}
            />
        </>
    );
}

export default VideoCell;
