import { useState } from "react";
import Comment from "../../../../entities/Comment";
import useCreateComment from "../../../../hooks/useCreateComment";
import CommentForm, { ErrorData } from "../CommentForm";

interface Props {
    comment: Comment;
    onReplyCreated: (reply: Comment) => void;
    onClose: () => void;
}

function CreateReplyForm({ comment, onReplyCreated, onClose }: Props) {
    const [errorData, setErrorData] = useState<ErrorData>();

    const createComment = useCreateComment({
        onError: (data) => setErrorData(data),
    });

    return (
        <CommentForm
            onSubmit={({ text }) => {
                createComment.mutate(
                    { videoId: comment.video, parentId: comment.id, text },
                    {
                        onSuccess: (comment) => {
                            onReplyCreated(comment);
                            onClose();
                        },
                    }
                );
            }}
            errorData={errorData}
            isAlwaysActive={true}
            onClose={onClose}
            avatarSize="sm"
            textareaPlaceholder="Add a reply..."
            textareaAutoFocus={true}
            submitButtonText="Reply"
        />
    );
}

export default CreateReplyForm;
