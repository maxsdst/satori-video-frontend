import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import {
    GetAllResponseCursorPagination,
    POPULAR_CACHE_KEY,
    popular,
} from "../../services/videoService";

export interface PopularVideosQuery extends BaseQuery {}

interface UsePopularVideosOptions {
    staleTime?: number;
    enabled?: boolean;
}

function usePopularVideos(
    query: PopularVideosQuery,
    { staleTime, enabled }: UsePopularVideosOptions
) {
    return useInfiniteQuery<GetAllResponseCursorPagination, Error>({
        queryKey: [POPULAR_CACHE_KEY, query],
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return popular({}, {}, pageParam);
            return popular({}, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default usePopularVideos;
