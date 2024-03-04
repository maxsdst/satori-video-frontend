import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Video from "../../entities/Video";
import videoService from "../../services/videoService";

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

function useUpdateVideo(videoId: number, { onError }: UseUpdateVideoOptions) {
    return useMutation<Video, AxiosError<ErrorData>, VideoData>({
        mutationFn: (data) => videoService.patch(videoId, data),
        onError: (error) => {
            if (error.response?.data) onError(error.response.data);
        },
    });
}

export default useUpdateVideo;
