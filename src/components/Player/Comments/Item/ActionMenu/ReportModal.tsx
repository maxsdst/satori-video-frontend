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
import Comment from "../../../../../entities/Comment";
import useCreateCommentReport, {
    REPORT_REASON_DESCRIPTIONS,
    ReportReason,
} from "../../../../../hooks/comment_reports/useCreateCommentReport";
import useOwnProfile from "../../../../../hooks/profiles/useOwnProfile";
import LoginRequestModal from "../../../../LoginRequestModal";

const schema = z.object({
    reason: z.nativeEnum(ReportReason),
});

type FormData = z.infer<typeof schema>;

interface Props {
    comment: Comment;
    isOpen: boolean;
    onClose: () => void;
}

function ReportModal({ comment, isOpen, onClose }: Props) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { isValid },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const createCommentReport = useCreateCommentReport({});

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
                header="Need to report the comment?"
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
            <ModalContent>
                <form
                    onSubmit={handleSubmit((data) => {
                        createCommentReport.mutate(
                            { ...data, commentId: comment.id },
                            {
                                onSuccess: () => setReportCreated(true),
                            }
                        );
                    })}
                >
                    <ModalHeader>Report comment</ModalHeader>
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
                                        {createCommentReport.error && (
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
                            isDisabled={
                                !isValid || createCommentReport.isLoading
                            }
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
