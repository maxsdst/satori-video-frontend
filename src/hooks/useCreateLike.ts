import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Like from "../entities/Like";
import likeService from "../services/likeService";

interface LikeData {
    videoId: number;
}

interface ErrorData {
    video?: string[];
}

interface UseCreateLikeOptions {
    onError?: (data: ErrorData) => void;
}

function useCreateLike({ onError }: UseCreateLikeOptions) {
    return useMutation<Like, AxiosError<ErrorData>, LikeData>({
        mutationFn: (data) => likeService.post({ video: data.videoId }),
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
        },
    });
}

export default useCreateLike;
