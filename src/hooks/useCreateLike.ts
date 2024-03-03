import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Like from "../entities/Like";
import Video from "../entities/Video";
import likeService from "../services/likeService";
import useOptimisticUpdate from "./useOptimisticUpdate";

interface ErrorData {
    video?: string[];
}

interface UseCreateLikeOptions {
    shouldUpdateVideoOptimistically?: boolean;
    onError?: (data: ErrorData) => void;
}

function useCreateLike(
    videoId: number,
    { shouldUpdateVideoOptimistically, onError }: UseCreateLikeOptions
) {
    const optimisticUpdate = useOptimisticUpdate<Video>({
        queryFilters: { queryKey: ["videos", videoId], exact: true },
        updater: (video) =>
            video &&
            produce(video, (draft) => {
                if (!draft.is_liked) draft.like_count += 1;
                draft.is_liked = true;
            }),
        shouldInvalidateQueries: true,
    });

    return useMutation<Like, AxiosError<ErrorData>, null>({
        mutationFn: () => likeService.post({ video: videoId }),
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

export default useCreateLike;
