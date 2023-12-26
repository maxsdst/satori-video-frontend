import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import CommentLike from "../entities/CommentLike";
import commentLikeService from "../services/commentLikeService";

interface CommentLikeData {
    commentId: number;
}

interface ErrorData {
    comment?: string[];
}

interface UseCreateCommentLikeOptions {
    onError?: (data: ErrorData) => void;
}

function useCreateCommentLike({ onError }: UseCreateCommentLikeOptions) {
    return useMutation<CommentLike, AxiosError<ErrorData>, CommentLikeData>({
        mutationFn: (data) =>
            commentLikeService.post({ comment: data.commentId }),
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
        },
    });
}

export default useCreateCommentLike;
