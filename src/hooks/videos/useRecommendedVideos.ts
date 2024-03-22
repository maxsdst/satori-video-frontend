import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import {
    GetAllResponseCursorPagination,
    RECOMMENDATIONS_CACHE_KEY,
    recommendations,
} from "../../services/videoService";

export interface RecommendedVideosQuery extends BaseQuery {}

interface UseRecommendedVideosOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useRecommendedVideos(
    query: RecommendedVideosQuery,
    { staleTime, enabled }: UseRecommendedVideosOptions
) {
    return useInfiniteQuery<GetAllResponseCursorPagination, Error>({
        queryKey: [RECOMMENDATIONS_CACHE_KEY, query],
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return recommendations({}, {}, pageParam);
            return recommendations({}, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useRecommendedVideos;
