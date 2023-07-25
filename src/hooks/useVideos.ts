import { useQuery } from "@tanstack/react-query";
import Video from "../entities/Video";
import ApiClient from "../services/ApiClient";

export interface VideoQuery {
    profileId?: number;
}

const apiClient = new ApiClient<Video>("/videos/videos/");

function useVideos(query: VideoQuery) {
    return useQuery<Video[], Error>({
        queryKey: ["videos", query],
        queryFn: () =>
            apiClient.getAll({ params: { profile: query.profileId } }),
    });
}

export default useVideos;
