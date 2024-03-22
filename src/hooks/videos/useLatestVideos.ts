import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import {
    GetAllResponseCursorPagination,
    LATEST_CACHE_KEY,
    latest,
} from "../../services/videoService";

export interface LatestVideosQuery extends BaseQuery {}

interface UseLatestVideosOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useLatestVideos(
    query: LatestVideosQuery,
    { staleTime, enabled }: UseLatestVideosOptions
) {
    return useInfiniteQuery<GetAllResponseCursorPagination, Error>({
        queryKey: [LATEST_CACHE_KEY, query],
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return latest({}, {}, pageParam);
            return latest({}, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useLatestVideos;
