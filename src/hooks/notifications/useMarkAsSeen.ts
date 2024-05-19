import { InfiniteData, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Notification from "../../entities/Notification";
import {
    GetAllResponse,
    NOTIFICATIONS_CACHE_KEY,
    UNSEEN_COUNT_CACHE_KEY,
    markAsSeen,
} from "../../services/notificationService";
import useOptimisticUpdate from "../useOptimisticUpdate";

interface Data {
    notificationIds: number[];
}

interface ErrorData {
    detail: string;
}

interface UseMarkAsSeenOptions {
    shouldUpdateNotificationsOptimistically?: boolean;
}

function useMarkAsSeen({
    shouldUpdateNotificationsOptimistically,
}: UseMarkAsSeenOptions) {
    const optimisticUpdateUnseen = useOptimisticUpdate<number, Data>({
        queryFilters: { queryKey: [UNSEEN_COUNT_CACHE_KEY], exact: true },
        updater: (data, variables) => {
            if (!data || !variables) return data;
            return data - variables.notificationIds.length;
        },
        shouldInvalidateQueries: true,
    });

    const optimisticUpdateNotifications = useOptimisticUpdate<
        InfiniteData<GetAllResponse> | Notification,
        Data
    >({
        queryFilters: { queryKey: [NOTIFICATIONS_CACHE_KEY] },
        updater: (data, variables) => {
            if (!data || !variables) return data;

            if ("pages" in data)
                return produce(data, (draft) => {
                    for (const page of draft.pages)
                        for (const notification of page.results)
                            if (
                                variables.notificationIds.includes(
                                    notification.id
                                )
                            )
                                notification.is_seen = true;
                });

            return produce(data, (draft) => {
                if (variables.notificationIds.includes(draft.id))
                    draft.is_seen = true;
            });
        },
        shouldInvalidateQueries: false,
    });

    return useMutation<null, AxiosError<ErrorData>, Data>({
        mutationFn: (data) => markAsSeen(data.notificationIds),
        onMutate: async (variables) => {
            if (shouldUpdateNotificationsOptimistically) {
                await optimisticUpdateNotifications.onMutate(variables);
                await optimisticUpdateUnseen.onMutate(variables);
            }
        },
        onError: () => {
            if (shouldUpdateNotificationsOptimistically) {
                optimisticUpdateNotifications.onError();
                optimisticUpdateUnseen.onError();
            }
        },
        onSettled: () => {
            if (shouldUpdateNotificationsOptimistically) {
                optimisticUpdateNotifications.onSettled();
                optimisticUpdateUnseen.onSettled();
            }
        },
    });
}

export default useMarkAsSeen;
