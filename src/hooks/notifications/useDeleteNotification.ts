import { InfiniteData, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Notification from "../../entities/Notification";
import notificationService, {
    GetAllResponse,
    NOTIFICATIONS_CACHE_KEY,
} from "../../services/notificationService";
import useOptimisticUpdate from "../useOptimisticUpdate";

interface ErrorData {
    detail: string;
}

interface UseDeleteNotificationOptions {
    shouldUpdateNotificationsOptimistically?: boolean;
}

function useDeleteNotification(
    notificationId: number,
    { shouldUpdateNotificationsOptimistically }: UseDeleteNotificationOptions
) {
    const optimisticUpdate = useOptimisticUpdate<
        InfiniteData<GetAllResponse> | Notification
    >({
        queryFilters: { queryKey: [NOTIFICATIONS_CACHE_KEY] },
        updater: (data) => {
            if (!data) return data;
            if (!("pages" in data)) return data;

            return produce(data, (draft) => {
                for (const page of draft.pages) {
                    const index = page.results.findIndex(
                        (item) => item.id === notificationId
                    );
                    if (index > -1) page.results.splice(index, 1);
                }
            });
        },
        shouldInvalidateQueries: false,
    });

    return useMutation<Notification, AxiosError<ErrorData>, null>({
        mutationFn: () => notificationService.delete(notificationId),
        onMutate: async () => {
            if (shouldUpdateNotificationsOptimistically)
                await optimisticUpdate.onMutate();
        },
        onError: () => {
            if (shouldUpdateNotificationsOptimistically)
                optimisticUpdate.onError();
        },
        onSettled: () => {
            if (shouldUpdateNotificationsOptimistically)
                optimisticUpdate.onSettled();
        },
    });
}

export default useDeleteNotification;
