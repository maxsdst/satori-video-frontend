import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import savedVideoService, {
    GetAllResponse,
    SAVED_VIDEOS_CACHE_KEY,
} from "../../services/savedVideoService";

export interface SavedVideosQuery extends BaseQuery {}

interface UseSavedVideosOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useSavedVideos(
    query: SavedVideosQuery,
    { staleTime, enabled }: UseSavedVideosOptions
) {
    return useInfiniteQuery<GetAllResponse, Error>({
        queryKey: [SAVED_VIDEOS_CACHE_KEY, query],
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return savedVideoService.getAll({}, {}, pageParam);
            return savedVideoService.getAll({}, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useSavedVideos;
