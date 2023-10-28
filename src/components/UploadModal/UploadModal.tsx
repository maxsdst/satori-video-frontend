import {
    Box,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import { useState } from "react";
import Upload from "../../entities/Upload";
import Video from "../../entities/Video";
import EditVideoModal from "../EditVideoModal";
import ProgressBar from "../ProgressBar";
import ProcessingBar from "./ProcessingBar";
import UploadForm from "./UploadForm";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUploadCreated: () => void;
    onVideoMutated: () => void;
}

function UploadModal({
    isOpen,
    onClose,
    onUploadCreated,
    onVideoMutated,
}: Props) {
    const [step, setStep] = useState<
        "select_file" | "uploading" | "processing" | "edit"
    >("select_file");
    const [percentCompleted, setPercentCompleted] = useState(0);
    const [upload, setUpload] = useState<Upload | null>(null);
    const [video, setVideo] = useState<Video | null>(null);

    function closeModal() {
        setStep("select_file");
        setPercentCompleted(0);
        setUpload(null);
        setVideo(null);
        onClose();
    }

    const verticalOffset = "4rem";
    const modalHeight = `calc(100% - (${verticalOffset} * 2))`;

    return (
        <>
            <Modal
                size="4xl"
                isOpen={isOpen && step !== "edit"}
                onClose={closeModal}
                closeOnOverlayClick={false}
            >
                <ModalOverlay />
                <ModalContent
                    top={verticalOffset}
                    margin={0}
                    height={modalHeight}
                >
                    <ModalHeader>Upload video</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody paddingBottom={6} height="100%">
                        <Box position="relative" width="100%" height="100%">
                            <UploadForm
                                onSubmit={() => setStep("uploading")}
                                onUploadProgress={setPercentCompleted}
                                onUploadCreated={(upload) => {
                                    onUploadCreated();
                                    setUpload(upload);
                                    setStep("processing");
                                }}
                                isDisabled={step !== "select_file"}
                            />
                            <Box position="absolute" bottom={0} width="100%">
                                {step === "uploading" && (
                                    <ProgressBar
                                        label="Uploading..."
                                        percentCompleted={percentCompleted}
                                    />
                                )}
                                {step === "processing" && upload && (
                                    <ProcessingBar
                                        uploadId={upload.id}
                                        onUploadProcessed={(video) => {
                                            setVideo(video);
                                            setStep("edit");
                                            onVideoMutated();
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
                    </ModalBody>
                </ModalContent>
            </Modal>
            {video && (
                <EditVideoModal
                    video={video}
                    isOpen={isOpen && step === "edit"}
                    onClose={closeModal}
                    onVideoEdited={onVideoMutated}
                />
            )}
        </>
    );
}

export default UploadModal;
