import { HStack, Text, useDisclosure } from "@chakra-ui/react";
import { AiOutlineEdit } from "react-icons/ai";
import Upload from "../../entities/Upload";
import EditVideoModal from "../EditVideoModal";
import IconButton from "../IconButton";

interface Props {
    upload: Upload;
    onVideoMutated: () => void;
}

function FileCell({ upload, onVideoMutated }: Props) {
    const {
        isOpen: isEditVideoModalOpen,
        onOpen: openEditVideoModal,
        onClose: closeEditVideoModal,
    } = useDisclosure();

    return (
        <>
            <HStack lineHeight="normal">
                <Text
                    _hover={
                        upload.is_done
                            ? {
                                  cursor: "pointer",
                                  textDecoration: "underline",
                              }
                            : undefined
                    }
                    onClick={() => upload.is_done && openEditVideoModal()}
                    noOfLines={1}
                    whiteSpace="normal"
                >
                    {upload.filename}
                </Text>
                {upload.is_done && (
                    <IconButton
                        icon={AiOutlineEdit}
                        size="sm"
                        label="Edit video"
                        onClick={openEditVideoModal}
                    />
                )}
            </HStack>
            {upload.video && (
                <EditVideoModal
                    video={upload.video}
                    isOpen={isEditVideoModalOpen}
                    onClose={closeEditVideoModal}
                    onVideoEdited={onVideoMutated}
                />
            )}
        </>
    );
}

export default FileCell;