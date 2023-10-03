import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Video from "../entities/Video";
import ApiClient from "../services/ApiClient";

interface ErrorData {
    detail: string;
}

const apiClient = new ApiClient<Video>("/videos/videos/");

function useDeleteVideo(videoId: number) {
    return useMutation<Video, AxiosError<ErrorData>, null>({
        mutationFn: () => apiClient.delete(videoId),
    });
}

export default useDeleteVideo;
