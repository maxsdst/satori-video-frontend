import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Video from "../entities/Video";
import { removeVideoFromSaved } from "../services/savedVideoService";
import useOptimisticUpdate from "./useOptimisticUpdate";

interface ErrorData {
    detail: string;
}

interface UseRemoveVideoFromSavedOptions {
    shouldUpdateVideoOptimistically?: boolean;
}

function useRemoveVideoFromSaved(
    videoId: number,
    { shouldUpdateVideoOptimistically }: UseRemoveVideoFromSavedOptions
) {
    const optimisticUpdate = useOptimisticUpdate<Video>({
        queryKey: ["videos", videoId],
        updater: (video) => ({ ...video, is_saved: false }),
    });

    return useMutation<null, AxiosError<ErrorData>, null>({
        mutationFn: () => removeVideoFromSaved(videoId),
        onMutate: async () => {
            if (shouldUpdateVideoOptimistically)
                await optimisticUpdate.onMutate();
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
