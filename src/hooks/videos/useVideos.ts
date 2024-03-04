import { useQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import videoService, {
    GetAllResponse,
    VIDEOS_CACHE_KEY,
} from "../../services/videoService";

export interface VideoQuery extends BaseQuery {
    profileId?: number;
}

interface UseVideosOptions {
    staleTime?: number;
    enabled?: boolean;
    keepPreviousData?: boolean;
}

function useVideos(
    query: VideoQuery,
    { staleTime, enabled, keepPreviousData }: UseVideosOptions
) {
    return useQuery<GetAllResponse, Error>({
        queryKey: [VIDEOS_CACHE_KEY, query],
        staleTime,
        queryFn: () =>
            videoService.getAll(
                {
                    params: {
                        profile: query.profileId,
                    },
                },
                query
            ),
        enabled,
        keepPreviousData,
    });
}

export default useVideos;
