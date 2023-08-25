import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Video from "../entities/Video";
import ApiClient from "../services/ApiClient";

interface VideoData {
    title?: string;
    description?: string;
}

interface ErrorData {
    title?: string[];
    description?: string[];
}

interface UseUpdateVideoOptions {
    onError: (data: ErrorData) => void;
}

const apiClient = new ApiClient<Video>("/videos/videos/");

function useUpdateVideo(videoId: number, { onError }: UseUpdateVideoOptions) {
    return useMutation<Video, AxiosError<ErrorData>, VideoData>({
        mutationFn: (data) => apiClient.patch(videoId, data),
        onError: (error) => {
            if (error.response?.data) onError(error.response.data);
        },
    });
}

export default useUpdateVideo;
