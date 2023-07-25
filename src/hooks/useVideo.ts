import { useQuery } from "@tanstack/react-query";
import Video from "../entities/Video";
import ApiClient from "../services/ApiClient";

const apiClient = new ApiClient<Video>("/videos/videos/");

function useVideo(videoId: number) {
    return useQuery<Video, Error>({
        queryKey: ["videos", videoId],
        queryFn: () => apiClient.get(videoId),
    });
}

export default useVideo;
