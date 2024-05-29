import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Comment from "../../entities/Comment";
import commentService, {
    COMMENTS_CACHE_KEY,
} from "../../services/commentService";

interface CommentData {
    videoId: number;
    parentId?: number;
    mentionedProfile?: number;
    text: string;
}

interface ErrorData {
    video?: string[];
    parent?: string[];
    text?: string[];
    detail?: string[];
}

interface UseCreateCommentOptions {
    onError?: (data: ErrorData) => void;
}

function useCreateComment({ onError }: UseCreateCommentOptions) {
    const queryClient = useQueryClient();

    return useMutation<Comment, AxiosError<ErrorData>, CommentData>({
        mutationFn: (data) =>
            commentService.post({
                video: data.videoId,
                parent: data.parentId || null,
                mentioned_profile: data.mentionedProfile || null,
                text: data.text,
            }),
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
        },
        onSuccess: (comment) =>
            queryClient.setQueryData([COMMENTS_CACHE_KEY, comment.id], comment),
    });
}

export default useCreateComment;
