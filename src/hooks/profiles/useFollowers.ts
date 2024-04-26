import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import {
    FOLLOWERS_CACHE_KEY,
    GetAllResponse,
    followers,
} from "../../services/profileService";

export interface FollowersQuery extends BaseQuery {
    username: string;
}

interface UseFollowersOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useFollowers(
    query: FollowersQuery,
    { staleTime, enabled }: UseFollowersOptions
) {
    return useInfiniteQuery<GetAllResponse, Error>({
        queryKey: [FOLLOWERS_CACHE_KEY, query],
        keepPreviousData: true,
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return followers(query.username, {}, pageParam);
            return followers(query.username, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useFollowers;
