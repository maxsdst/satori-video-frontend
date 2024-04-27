import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import {
    FOLLOWING_VIDEOS_CACHE_KEY,
    GetAllResponseCursorPagination,
    following,
} from "../../services/videoService";

export interface FollowingVideosQuery extends BaseQuery {}

interface UseFollowingVideosOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useFollowingVideos(
    query: FollowingVideosQuery,
    { staleTime, enabled }: UseFollowingVideosOptions
) {
    return useInfiniteQuery<GetAllResponseCursorPagination, Error>({
        queryKey: [FOLLOWING_VIDEOS_CACHE_KEY, query],
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return following({}, {}, pageParam);
            return following({}, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useFollowingVideos;
