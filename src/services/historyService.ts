import HistoryEntry, { DATE_FIELDS } from "../entities/HistoryEntry";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";
import BaseQuery from "./BaseQuery";

export const HISTORY_CACHE_KEY = "history";

export default new ApiClient<HistoryEntry>("/videos/history/", DATE_FIELDS);

export interface GroupedHistoryItem {
    date: string;
    entries: HistoryEntry[];
}

export function groupedByDate(query?: BaseQuery, fullUrl?: string) {
    const apiClient = new ApiClient<GroupedHistoryItem>(
        "/videos/history/grouped_by_date/"
    );
    return apiClient.getAll(
        {
            params: {
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        },
        query,
        fullUrl
    );
}

export type GetAllResponseGroupedByDate = GenericGetAllResponse<
    GroupedHistoryItem,
    PaginationType.Cursor
>;

export function removeVideoFromHistory(videoId: number) {
    const apiClient = new ApiClient<null>(
        "/videos/history/remove_video_from_history/"
    );
    return apiClient.post({ video: videoId });
}
