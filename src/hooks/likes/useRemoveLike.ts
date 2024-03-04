import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Video from "../../entities/Video";
import { removeLike } from "../../services/likeService";
import { VIDEOS_CACHE_KEY } from "../../services/videoService";
import useOptimisticUpdate from "../useOptimisticUpdate";

interface ErrorData {
    detail: string;
}

interface UseRemoveLikeOptions {
    shouldUpdateVideoOptimistically?: boolean;
}

function useRemoveLike(
    videoId: number,
    { shouldUpdateVideoOptimistically }: UseRemoveLikeOptions
) {
    const optimisticUpdate = useOptimisticUpdate<Video>({
        queryFilters: { queryKey: [VIDEOS_CACHE_KEY, videoId], exact: true },
        updater: (video) =>
            video &&
            produce(video, (draft) => {
                if (draft.is_liked) draft.like_count -= 1;
                draft.is_liked = false;
            }),
        shouldInvalidateQueries: true,
    });

    return useMutation<null, AxiosError<ErrorData>, null>({
        mutationFn: () => removeLike(videoId),
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

export default useRemoveLike;
