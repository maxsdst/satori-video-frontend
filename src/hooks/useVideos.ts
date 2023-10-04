import { useQuery } from "@tanstack/react-query";
import Video from "../entities/Video";
import ApiClient, { GetAllResponse } from "../services/ApiClient";

export interface VideoQuery {
    profileId?: number;
    limit?: number;
    offset?: number;
    ordering?: string;
}

interface UseVideosOptions {
    staleTime?: number;
    enabled?: boolean;
    keepPreviousData?: boolean;
}

const apiClient = new ApiClient<Video>("/videos/videos/");

function useVideos(
    query: VideoQuery,
    { staleTime, enabled, keepPreviousData }: UseVideosOptions
) {
    return useQuery<GetAllResponse<Video>, Error>({
        queryKey: ["videos", query],
        staleTime,
        queryFn: () =>
            apiClient.getAll({
                params: {
                    profile: query.profileId,
                    limit: query.limit,
                    offset: query.offset,
                    ordering: query.ordering,
                },
            }),
        enabled,
        keepPreviousData,
    });
}

export default useVideos;
