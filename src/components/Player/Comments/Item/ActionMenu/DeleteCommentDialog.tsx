import {
    Alert,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertIcon,
    Button,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useRef } from "react";
import Comment from "../../../../../entities/Comment";
import useDeleteComment from "../../../../../hooks/comments/useDeleteComment";

interface Props {
    comment: Comment;
    isOpen: boolean;
    onClose: () => void;
    onDeleted: () => void;
}

function DeleteCommentDialog({ comment, isOpen, onClose, onDeleted }: Props) {
    const deleteComment = useDeleteComment(comment.id);

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
                        Delete comment
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <VStack alignItems="start">
                            <Text>Delete your comment permanently?</Text>
                            {deleteComment.error && (
                                <Alert status="error">
                                    <AlertIcon />
                                    Something went wrong
                                </Alert>
                            )}
                        </VStack>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelButton} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={() =>
                                deleteComment.mutate(null, {
                                    onSuccess: () => {
                                        onClose();
                                        onDeleted();
                                    },
                                })
                            }
                            marginLeft={2}
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}

export default DeleteCommentDialog;
