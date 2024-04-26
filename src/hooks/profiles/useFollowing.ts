import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import {
    FOLLOWING_CACHE_KEY,
    GetAllResponse,
    following,
} from "../../services/profileService";

export interface FollowingQuery extends BaseQuery {
    username: string;
}

interface UseFollowingOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useFollowing(
    query: FollowingQuery,
    { staleTime, enabled }: UseFollowingOptions
) {
    return useInfiniteQuery<GetAllResponse, Error>({
        queryKey: [FOLLOWING_CACHE_KEY, query],
        keepPreviousData: true,
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return following(query.username, {}, pageParam);
            return following(query.username, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useFollowing;
