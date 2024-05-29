import { InfiniteData, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Comment from "../../entities/Comment";
import commentService, {
    COMMENTS_CACHE_KEY,
    GetAllResponse,
} from "../../services/commentService";
import useOptimisticUpdate from "../useOptimisticUpdate";

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
    const optimisticUpdate = useOptimisticUpdate<
        InfiniteData<GetAllResponse> | Comment,
        CommentData
    >({
        queryFilters: { queryKey: [COMMENTS_CACHE_KEY] },
        updater: (data, variables) => {
            if (!data || !variables) return data;

            if ("pages" in data)
                return produce(data, (draft) => {
                    for (const page of draft.pages)
                        for (const comment of page.results)
                            if (comment.id === commentId) {
                                comment.text = variables.text;
                                return;
                            }
                });

            return produce(data, (draft) => {
                if (draft.id === commentId) draft.text = variables.text;
            });
        },
        shouldInvalidateQueries: false,
    });

    return useMutation<Comment, AxiosError<ErrorData>, CommentData>({
        mutationFn: (data) => commentService.patch(commentId, data),
        onMutate: async (variables) => {
            await optimisticUpdate.onMutate(variables);
        },
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
            optimisticUpdate.onError();
        },
        onSettled: () => {
            optimisticUpdate.onSettled();
        },
    });
}

export default useUpdateComment;
