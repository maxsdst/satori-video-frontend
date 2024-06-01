import { useDisclosure } from "@chakra-ui/react";
import { useRef, useState } from "react";
import Comment from "../../../entities/Comment";
import useCreateComment from "../../../hooks/comments/useCreateComment";
import useIsAuthenticated from "../../../hooks/useIsAuthenticated";
import LoginRequestModal from "../../LoginRequestModal";
import CommentForm, { CommentFormHandle, ErrorData } from "./CommentForm";

interface Props {
    videoId: number;
    onCommentCreated: (comment: Comment) => void;
}

function CreateCommentForm({ videoId, onCommentCreated }: Props) {
    const [errorData, setErrorData] = useState<ErrorData>();

    const createComment = useCreateComment({
        onError: (data) => setErrorData(data),
    });

    const commentForm = useRef<CommentFormHandle>(null);

    const {
        isOpen: isLoginRequestModalOpen,
        onOpen: openLoginRequestModal,
        onClose: closeLoginRequestModal,
    } = useDisclosure();

    const isAuthenticated = useIsAuthenticated();

    if (isAuthenticated === undefined) return null;

    return (
        <>
            <CommentForm
                ref={commentForm}
                onSubmit={({ text }) => {
                    createComment.mutate(
                        { videoId, text },
                        {
                            onSuccess: (comment) => {
                                commentForm.current?.reset();
                                commentForm.current?.deactivate();
                                onCommentCreated(comment);
                            },
                        }
                    );
                }}
                errorData={errorData}
                avatarSize="md"
                textareaPlaceholder="Add a comment..."
                submitButtonText="Comment"
                onInput={() => !isAuthenticated && openLoginRequestModal()}
            />
            {!isAuthenticated && (
                <LoginRequestModal
                    isOpen={isLoginRequestModalOpen}
                    onClose={closeLoginRequestModal}
                    header="Want to leave a comment?"
                >
                    Sign in to leave a comment.
                </LoginRequestModal>
            )}
        </>
    );
}

export default CreateCommentForm;
