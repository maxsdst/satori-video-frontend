import { useState } from "react";
import Comment from "../../../../entities/Comment";
import useCreateComment from "../../../../hooks/comments/useCreateComment";
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

    const shouldMentionProfile = !!comment.parent;

    return (
        <CommentForm
            ariaLabel="Add a reply"
            onSubmit={({ text }) => {
                createComment.mutate(
                    {
                        videoId: comment.video,
                        parentId: shouldMentionProfile
                            ? comment.parent || undefined
                            : comment.id,
                        mentionedProfile: shouldMentionProfile
                            ? comment.profile.id
                            : undefined,
                        text,
                    },
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
            mentionedUsername={
                shouldMentionProfile ? comment.profile.user.username : undefined
            }
        />
    );
}

export default CreateReplyForm;
