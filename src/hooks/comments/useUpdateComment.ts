import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Comment from "../../entities/Comment";
import commentService from "../../services/commentService";

interface CommentData {
    text: string;
}

interface ErrorData {
    text?: string[];
}

interface UseUpdateCommentOptions {
    onError: (data: ErrorData) => void;
}

function useUpdateComment(
    commentId: number,
    { onError }: UseUpdateCommentOptions
) {
    return useMutation<Comment, AxiosError<ErrorData>, CommentData>({
        mutationFn: (data) => commentService.patch(commentId, data),
        onError: (error) => {
            if (error.response?.data) onError(error.response.data);
        },
    });
}

export default useUpdateComment;
