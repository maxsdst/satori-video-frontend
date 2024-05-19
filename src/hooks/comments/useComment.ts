import { useQuery } from "@tanstack/react-query";
import Comment from "../../entities/Comment";
import commentService, {
    COMMENTS_CACHE_KEY,
} from "../../services/commentService";

interface UseCommentOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useComment(
    commentId: number,
    { staleTime, enabled }: UseCommentOptions
) {
    return useQuery<Comment, Error>({
        queryKey: [COMMENTS_CACHE_KEY, commentId],
        queryFn: () => commentService.get(commentId),
        staleTime,
        enabled,
    });
}

export default useComment;
