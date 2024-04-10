import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import {
    GetAllResponseGroupedByDate,
    HISTORY_CACHE_KEY,
    groupedByDate,
} from "../../services/historyService";

export interface HistoryQuery extends BaseQuery {}

interface UseGroupedByDate {
    staleTime?: number;
    enabled?: boolean;
}

function useGroupedByDate(
    query: HistoryQuery,
    { staleTime, enabled }: UseGroupedByDate
) {
    return useInfiniteQuery<GetAllResponseGroupedByDate, Error>({
        queryKey: [HISTORY_CACHE_KEY, query],
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return groupedByDate({}, pageParam);
            return groupedByDate(query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useGroupedByDate;
