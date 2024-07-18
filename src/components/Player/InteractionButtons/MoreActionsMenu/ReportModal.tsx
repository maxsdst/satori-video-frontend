import {
    Alert,
    AlertIcon,
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    RadioGroup,
    VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Video from "../../../../entities/Video";
import useOwnProfile from "../../../../hooks/profiles/useOwnProfile";
import useCreateReport, {
    REPORT_REASON_DESCRIPTIONS,
    ReportReason,
} from "../../../../hooks/reports/useCreateReport";
import LoginRequestModal from "../../../LoginRequestModal";

const schema = z.object({
    reason: z.nativeEnum(ReportReason),
});

type FormData = z.infer<typeof schema>;

interface Props {
    video: Video;
    isOpen: boolean;
    onClose: () => void;
}

function ReportModal({ video, isOpen, onClose }: Props) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { isValid },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const createReport = useCreateReport({});

    const ownProfile = useOwnProfile();

    const [isReportCreated, setReportCreated] = useState(false);

    function handleClose() {
        reset();
        setReportCreated(false);
        onClose();
    }

    if (ownProfile.isLoading) return null;

    if (!ownProfile.data)
        return (
            <LoginRequestModal
                isOpen={isOpen}
                onClose={onClose}
                header="Need to report the video?"
            >
                Sign in to report content that breaks our rules.
            </LoginRequestModal>
        );

    if (isReportCreated)
        return (
            <Modal isOpen={isOpen} onClose={handleClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalBody paddingTop={6}>
                        Thanks. We've received your report. If we find this
                        content to be in violation of our rules, we will remove
                        it.
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleClose}>
                            OK
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent data-testid="report-modal">
                <form
                    onSubmit={handleSubmit((data) => {
                        createReport.mutate(
                            { ...data, videoId: video.id },
                            {
                                onSuccess: () => setReportCreated(true),
                            }
                        );
                    })}
                >
                    <ModalHeader>Report video</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Controller
                            control={control}
                            name="reason"
                            render={({ field: { onChange } }) => (
                                <RadioGroup onChange={onChange}>
                                    <VStack alignItems="start" spacing={4}>
                                        {Object.values(ReportReason).map(
                                            (reason) => (
                                                <Radio
                                                    key={reason}
                                                    value={reason}
                                                >
                                                    {
                                                        REPORT_REASON_DESCRIPTIONS[
                                                            reason
                                                        ]
                                                    }
                                                </Radio>
                                            )
                                        )}
                                        {createReport.error && (
                                            <Alert status="error">
                                                <AlertIcon />
                                                Something went wrong
                                            </Alert>
                                        )}
                                    </VStack>
                                </RadioGroup>
                            )}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            type="submit"
                            colorScheme="blue"
                            isDisabled={!isValid || createReport.isLoading}
                        >
                            Report
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

export default ReportModal;
