import Notification, { DATE_FIELDS } from "../entities/Notification";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";

export const NOTIFICATIONS_CACHE_KEY = "notifications";
export const UNSEEN_COUNT_CACHE_KEY = "unseen_notification_count";

export default new ApiClient<Notification, PaginationType.Cursor>(
    "/notifications/notifications",
    DATE_FIELDS
);

export type GetAllResponse = GenericGetAllResponse<
    Notification,
    PaginationType.Cursor
>;

interface UnseenCountData {
    unseen_count: number;
}

export function markAsSeen(notificationIds: number[]) {
    const apiClient = new ApiClient<null>(
        "/notifications/notifications/mark_as_seen/"
    );
    return apiClient.post({ notification_ids: notificationIds });
}

export function unseenCount() {
    const apiClient = new ApiClient<UnseenCountData>(
        "/notifications/notifications/unseen_count/"
    );
    return apiClient.get().then((data) => data.unseen_count);
}
