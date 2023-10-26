import { useQuery } from "@tanstack/react-query";
import Video from "../entities/Video";
import { GetAllResponse } from "../services/ApiClient";
import BaseQuery from "../services/BaseQuery";
import videoService from "../services/videoService";

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
    return useQuery<GetAllResponse<Video>, Error>({
        queryKey: ["videos", query],
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
