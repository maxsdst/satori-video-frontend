import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import {
    GetAllResponse,
    PROFILE_SEARCH_CACHE_KEY,
    search,
} from "../../services/profileService";

export interface ProfileSearchQuery extends BaseQuery {
    searchQuery: string;
}

interface UseProfileSearchOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useProfileSearch(
    query: ProfileSearchQuery,
    { staleTime, enabled }: UseProfileSearchOptions
) {
    return useInfiniteQuery<GetAllResponse, Error>({
        queryKey: [PROFILE_SEARCH_CACHE_KEY, query],
        keepPreviousData: true,
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return search(query.searchQuery, {}, pageParam);
            return search(query.searchQuery, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useProfileSearch;
