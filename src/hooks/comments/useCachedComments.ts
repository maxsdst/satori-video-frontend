import { useQueries } from "@tanstack/react-query";
import commentService, {
    COMMENTS_CACHE_KEY,
} from "../../services/commentService";

function useCachedComments(commentIds: number[]) {
    const queries = useQueries({
        queries: commentIds.map((commentId) => ({
            queryKey: [COMMENTS_CACHE_KEY, commentId],
            queryFn: () => commentService.get(commentId),
            staleTime: Infinity,
            enabled: false,
        })),
    });

    return queries.map((query) => query.data);
}

export default useCachedComments;
