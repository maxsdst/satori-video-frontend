import { useQuery } from "@tanstack/react-query";
import Video from "../entities/Video";
import videoService from "../services/videoService";

function useVideo(videoId: number) {
    return useQuery<Video, Error>({
        queryKey: ["videos", videoId],
        queryFn: () => videoService.get(videoId),
    });
}

export default useVideo;
