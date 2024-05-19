import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import notificationService, {
    GetAllResponse,
    NOTIFICATIONS_CACHE_KEY,
} from "../../services/notificationService";

export interface NotificationsQuery extends BaseQuery {}

interface UseNotificationsOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useNotifications(
    query: NotificationsQuery,
    { staleTime, enabled }: UseNotificationsOptions
) {
    return useInfiniteQuery<GetAllResponse, Error>({
        queryKey: [NOTIFICATIONS_CACHE_KEY, query],
        keepPreviousData: true,
        staleTime,
        enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryFn: ({ pageParam }) => {
            if (pageParam) return notificationService.getAll({}, {}, pageParam);
            return notificationService.getAll({}, query);
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useNotifications;
