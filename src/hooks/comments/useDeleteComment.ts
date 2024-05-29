import { InfiniteData, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Comment from "../../entities/Comment";
import commentService, {
    COMMENTS_CACHE_KEY,
    GetAllResponse,
} from "../../services/commentService";
import useOptimisticUpdate from "../useOptimisticUpdate";

interface ErrorData {
    detail: string;
}

function useDeleteComment(commentId: number) {
    const optimisticUpdate = useOptimisticUpdate<
        InfiniteData<GetAllResponse> | Comment
    >({
        queryFilters: { queryKey: [COMMENTS_CACHE_KEY] },
        updater: (data) => {
            if (!data) return data;
            if (!("pages" in data)) return data;

            return produce(data, (draft) => {
                for (const page of draft.pages) {
                    const index = page.results.findIndex(
                        (item) => item.id === commentId
                    );
                    if (index > -1) page.results.splice(index, 1);
                }
            });
        },
        shouldInvalidateQueries: false,
    });

    return useMutation<Comment, AxiosError<ErrorData>, null>({
        mutationFn: () => commentService.delete(commentId),
        onMutate: async () => {
            await optimisticUpdate.onMutate();
        },
        onError: () => {
            optimisticUpdate.onError();
        },
        onSettled: () => {
            optimisticUpdate.onSettled();
        },
    });
}

export default useDeleteComment;
