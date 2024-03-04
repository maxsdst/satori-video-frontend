import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import viewService from "../../services/viewService";

interface ViewData {
    videoId: number;
}

interface ErrorData {
    video?: string[];
}

interface UseCreateViewOptions {
    onError?: (data: ErrorData) => void;
}

function useCreateView({ onError }: UseCreateViewOptions) {
    return useMutation<null, AxiosError<ErrorData>, ViewData>({
        mutationFn: (data) => viewService.post({ video: data.videoId }),
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
        },
    });
}

export default useCreateView;
