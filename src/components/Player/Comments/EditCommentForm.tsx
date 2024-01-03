import { useState } from "react";
import Comment from "../../../entities/Comment";
import useUpdateComment from "../../../hooks/useUpdateComment";
import CommentForm, { ErrorData } from "./CommentForm";

interface Props {
    comment: Comment;
    isReply: boolean;
    onCommentEdited: (comment: Comment) => void;
    onClose: () => void;
}

function EditCommentForm({
    comment,
    isReply,
    onCommentEdited,
    onClose,
}: Props) {
    const [errorData, setErrorData] = useState<ErrorData>();

    const updateComment = useUpdateComment(comment.id, {
        onError: (data) => setErrorData(data),
    });

    return (
        <CommentForm
            onSubmit={({ text }) => {
                updateComment.mutate(
                    { text },
                    {
                        onSuccess: (comment) => {
                            onCommentEdited(comment);
                            onClose();
                        },
                    }
                );
            }}
            errorData={errorData}
            isAlwaysActive={true}
            onClose={onClose}
            avatarSize={comment.parent ? "sm" : "md"}
            textareaPlaceholder={
                isReply ? "Add a reply..." : "Add a comment..."
            }
            textareaAutoFocus={true}
            defaultTextareaValue={comment.text}
            submitButtonText="Save"
            mentionedUsername={comment.mentioned_profile_username || undefined}
        />
    );
}

export default EditCommentForm;
