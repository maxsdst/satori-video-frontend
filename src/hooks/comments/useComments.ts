import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import commentService, {
    COMMENTS_CACHE_KEY,
    GetAllResponse,
} from "../../services/commentService";

export interface CommentQuery extends BaseQuery {
    videoId?: number;
    parentId?: number;
}

interface UseCommentsOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useComments(
    query: CommentQuery,
    { staleTime, enabled }: UseCommentsOptions
) {
    return useInfiniteQuery<GetAllResponse, Error>({
        queryKey: [COMMENTS_CACHE_KEY, query],
        staleTime,
        enabled,
        queryFn: ({ pageParam }) => {
            if (pageParam) return commentService.getAll({}, {}, pageParam);
            return commentService.getAll(
                {
                    params: {
                        video: query.videoId,
                        parent: query.parentId,
                    },
                },
                query
            );
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useComments;
