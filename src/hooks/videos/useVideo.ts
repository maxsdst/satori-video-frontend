import { useQuery } from "@tanstack/react-query";
import Video from "../../entities/Video";
import videoService, { VIDEOS_CACHE_KEY } from "../../services/videoService";

interface UseVideoOptions {
    staleTime?: number;
    enabled?: boolean;
    initialData?: Video;
}

function useVideo(
    videoId: number,
    { staleTime, enabled, initialData }: UseVideoOptions
) {
    return useQuery<Video, Error>({
        queryKey: [VIDEOS_CACHE_KEY, videoId],
        queryFn: () => videoService.get(videoId),
        staleTime,
        enabled,
        initialData,
    });
}

export default useVideo;
