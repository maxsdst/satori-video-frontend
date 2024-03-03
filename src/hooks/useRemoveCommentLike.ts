import { InfiniteData, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Comment from "../entities/Comment";
import { removeLike } from "../services/commentLikeService";
import { COMMENTS_CACHE_KEY, GetAllResponse } from "../services/commentService";
import useOptimisticUpdate from "./useOptimisticUpdate";

interface ErrorData {
    detail: string;
}

interface UseRemoveCommentLikeOptions {
    shouldUpdateCommentOptimistically?: boolean;
}

function useRemoveCommentLike(
    commentId: number,
    { shouldUpdateCommentOptimistically }: UseRemoveCommentLikeOptions
) {
    function updateComment(comment: Comment) {
        if (comment.is_liked) comment.like_count -= 1;
        comment.is_liked = false;
    }

    const optimisticUpdate = useOptimisticUpdate<
        InfiniteData<GetAllResponse> | Comment
    >({
        queryFilters: { queryKey: [COMMENTS_CACHE_KEY] },
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

    return useMutation<null, AxiosError<ErrorData>, null>({
        mutationFn: () => removeLike(commentId),
        onMutate: async () => {
            if (shouldUpdateCommentOptimistically)
                await optimisticUpdate.onMutate();
        },
        onError: () => {
            if (shouldUpdateCommentOptimistically) optimisticUpdate.onError();
        },
        onSettled: () => {
            if (shouldUpdateCommentOptimistically) optimisticUpdate.onSettled();
        },
    });
}

export default useRemoveCommentLike;
