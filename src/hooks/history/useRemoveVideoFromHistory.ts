import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
    HISTORY_CACHE_KEY,
    removeVideoFromHistory,
} from "../../services/historyService";

interface ErrorData {
    detail: string;
}

function useRemoveVideoFromHistory(videoId: number) {
    const queryClient = useQueryClient();

    return useMutation<null, AxiosError<ErrorData>, null>({
        mutationFn: () => removeVideoFromHistory(videoId),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [HISTORY_CACHE_KEY] }),
    });
}

export default useRemoveVideoFromHistory;
