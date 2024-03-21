import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import eventService from "../../services/eventService";

export enum EventType {
    VIEW = "view",
    LIKE = "like",
    SHARE = "share",
    SAVE = "save",
}

interface EventData {
    videoId: number;
    type: EventType;
}

interface ErrorData {
    video?: string[];
    type?: string[];
}

interface UseCreateEventOptions {
    onError?: (data: ErrorData) => void;
}

function useCreateEvent({ onError }: UseCreateEventOptions) {
    return useMutation<null, AxiosError<ErrorData>, EventData>({
        mutationFn: (data) =>
            eventService.post({
                video: data.videoId,
                type: data.type,
            }),
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
        },
    });
}

export default useCreateEvent;
