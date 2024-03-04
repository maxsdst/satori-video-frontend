import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Video from "../../entities/Video";
import videoService from "../../services/videoService";

interface ErrorData {
    detail: string;
}

function useDeleteVideo(videoId: number) {
    return useMutation<Video, AxiosError<ErrorData>, null>({
        mutationFn: () => videoService.delete(videoId),
    });
}

export default useDeleteVideo;
