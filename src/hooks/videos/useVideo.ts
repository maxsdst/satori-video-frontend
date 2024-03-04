import { useQuery } from "@tanstack/react-query";
import Video from "../../entities/Video";
import videoService, { VIDEOS_CACHE_KEY } from "../../services/videoService";

function useVideo(videoId: number) {
    return useQuery<Video, Error>({
        queryKey: [VIDEOS_CACHE_KEY, videoId],
        queryFn: () => videoService.get(videoId),
    });
}

export default useVideo;
