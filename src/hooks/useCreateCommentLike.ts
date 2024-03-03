import { InfiniteData, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Comment from "../entities/Comment";
import CommentLike from "../entities/CommentLike";
import commentLikeService from "../services/commentLikeService";
import { GetAllResponse } from "../services/commentService";
import useOptimisticUpdate from "./useOptimisticUpdate";

interface ErrorData {
    comment?: string[];
}

interface UseCreateCommentLikeOptions {
    shouldUpdateCommentOptimistically?: boolean;
    onError?: (data: ErrorData) => void;
}

function useCreateCommentLike(
    commentId: number,
    { shouldUpdateCommentOptimistically, onError }: UseCreateCommentLikeOptions
) {
    function updateComment(comment: Comment) {
        if (!comment.is_liked) comment.like_count += 1;
        comment.is_liked = true;
    }

    const optimisticUpdate = useOptimisticUpdate<
        InfiniteData<GetAllResponse> | Comment
    >({
        queryFilters: { queryKey: ["comments"] },
        updater: (data) => {
            if (!data) return data;

            if ("pages" in data)
                return produce(data, (draft) => {
                    for (const page of draft.pages)
                        for (const comment of page.results)
                            if (comment.id === commentId) {
                                updateComment(comment);
                                return;
                            }
                });

            return produce(data, (draft) => {
                if (draft.id === commentId) updateComment(draft);
            });
        },
    });

    return useMutation<CommentLike, AxiosError<ErrorData>, null>({
        mutationFn: () => commentLikeService.post({ comment: commentId }),
        onMutate: async () => {
            if (shouldUpdateCommentOptimistically)
                await optimisticUpdate.onMutate();
        },
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
            if (shouldUpdateCommentOptimistically) optimisticUpdate.onError();
        },
        onSettled: () => {
            if (shouldUpdateCommentOptimistically) optimisticUpdate.onSettled();
        },
    });
}

export default useCreateCommentLike;
