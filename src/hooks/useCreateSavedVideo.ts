import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import SavedVideo from "../entities/SavedVideo";
import Video from "../entities/Video";
import savedVideoService from "../services/savedVideoService";
import { VIDEOS_CACHE_KEY } from "../services/videoService";
import useOptimisticUpdate from "./useOptimisticUpdate";

interface ErrorData {
    video?: string[];
}

interface UseCreateSavedVideoOptions {
    shouldUpdateVideoOptimistically?: boolean;
    onError?: (data: ErrorData) => void;
}

function useCreateSavedVideo(
    videoId: number,
    { shouldUpdateVideoOptimistically, onError }: UseCreateSavedVideoOptions
) {
    const optimisticUpdate = useOptimisticUpdate<Video>({
        queryFilters: { queryKey: [VIDEOS_CACHE_KEY, videoId], exact: true },
        updater: (video) => video && { ...video, is_saved: true },
        shouldInvalidateQueries: true,
    });

    return useMutation<SavedVideo, AxiosError<ErrorData>, null>({
        mutationFn: () => savedVideoService.post({ video: videoId }),
        onMutate: async () => {
            if (shouldUpdateVideoOptimistically)
                await optimisticUpdate.onMutate();
        },
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
            if (shouldUpdateVideoOptimistically) optimisticUpdate.onError();
        },
        onSettled: () => {
            if (shouldUpdateVideoOptimistically) optimisticUpdate.onSettled();
        },
    });
}

export default useCreateSavedVideo;
