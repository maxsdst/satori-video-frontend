import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import {
    GetAllResponseCursorPagination,
    VIDEO_SEARCH_CACHE_KEY,
    search,
} from "../../services/videoService";

export interface VideoSearchQuery extends BaseQuery {
    searchQuery?: string;
}

interface UseVideoSearchOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useVideoSearch(
    query: VideoSearchQuery,
    { staleTime, enabled }: UseVideoSearchOptions
) {
    const searchQuery = query.searchQuery || "";

    return useInfiniteQuery<GetAllResponseCursorPagination, Error>({
        queryKey: [VIDEO_SEARCH_CACHE_KEY, query],
        keepPreviousData: true,
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return search(searchQuery, {}, pageParam);
            return search(searchQuery, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useVideoSearch;
