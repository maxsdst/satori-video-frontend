import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Video from "../../entities/Video";
import {
    SAVED_VIDEOS_CACHE_KEY,
    removeVideoFromSaved,
} from "../../services/savedVideoService";
import { VIDEOS_CACHE_KEY } from "../../services/videoService";
import useOptimisticUpdate from "../useOptimisticUpdate";

interface ErrorData {
    detail: string;
}

interface UseRemoveVideoFromSavedOptions {
    shouldUpdateVideoOptimistically?: boolean;
    shouldInvalidateQueries?: boolean;
}

function useRemoveVideoFromSaved(
    videoId: number,
    {
        shouldUpdateVideoOptimistically,
        shouldInvalidateQueries,
    }: UseRemoveVideoFromSavedOptions
) {
    const queryClient = useQueryClient();

    const optimisticUpdate = useOptimisticUpdate<Video>({
        queryFilters: { queryKey: [VIDEOS_CACHE_KEY, videoId], exact: true },
        updater: (video) => video && { ...video, is_saved: false },
        shouldInvalidateQueries: true,
    });

    return useMutation<null, AxiosError<ErrorData>, null>({
        mutationFn: () => removeVideoFromSaved(videoId),
        onMutate: async () => {
            if (shouldUpdateVideoOptimistically)
                await optimisticUpdate.onMutate();
        },
        onSuccess: () => {
            if (shouldInvalidateQueries)
                queryClient.invalidateQueries({
                    queryKey: [SAVED_VIDEOS_CACHE_KEY],
                });
        },
        onError: () => {
            if (shouldUpdateVideoOptimistically) optimisticUpdate.onError();
        },
        onSettled: () => {
            if (shouldUpdateVideoOptimistically) optimisticUpdate.onSettled();
        },
    });
}

export default useRemoveVideoFromSaved;
