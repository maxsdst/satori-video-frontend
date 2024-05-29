import { InfiniteData, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Video from "../../entities/Video";
import videoService, {
    GetAllResponse,
    VIDEOS_CACHE_KEY,
} from "../../services/videoService";
import useOptimisticUpdate from "../useOptimisticUpdate";

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
    function updateVideo(video: Video, variables: VideoData) {
        if (variables.title !== undefined) video.title = variables.title;
        if (variables.description !== undefined)
            video.description = variables.description;
    }

    const optimisticUpdate = useOptimisticUpdate<
        InfiniteData<GetAllResponse> | Video,
        VideoData
    >({
        queryFilters: { queryKey: [VIDEOS_CACHE_KEY] },
        updater: (data, variables) => {
            if (!data || !variables) return data;

            if ("pages" in data)
                return produce(data, (draft) => {
                    for (const page of draft.pages)
                        for (const video of page.results)
                            if (video.id === videoId) {
                                updateVideo(video, variables);
                                return;
                            }
                });

            return produce(data, (draft) => {
                if (draft.id === videoId) {
                    updateVideo(draft, variables);
                }
            });
        },
        shouldInvalidateQueries: false,
    });

    return useMutation<Video, AxiosError<ErrorData>, VideoData>({
        mutationFn: (data) => videoService.patch(videoId, data),
        onMutate: async (variables) => {
            await optimisticUpdate.onMutate(variables);
        },
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
            optimisticUpdate.onError();
        },
        onSettled: () => {
            optimisticUpdate.onSettled();
        },
    });
}

export default useUpdateVideo;
