import { AxiosRequestConfig } from "axios";
import Video, { DATE_FIELDS } from "../entities/Video";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";
import BaseQuery from "./BaseQuery";

export const VIDEOS_CACHE_KEY = "videos";
export const RECOMMENDATIONS_CACHE_KEY = "recommendations";
export const POPULAR_CACHE_KEY = "popular";
export const LATEST_CACHE_KEY = "latest";
export const VIDEO_SEARCH_CACHE_KEY = "video_search";
export const FOLLOWING_VIDEOS_CACHE_KEY = "following_videos";

export default new ApiClient<Video, PaginationType.LimitOffset>(
    "/videos/videos/",
    DATE_FIELDS
);

export type GetAllResponse = GenericGetAllResponse<
    Video,
    PaginationType.LimitOffset
>;

export function recommendations(
    requestConfig?: AxiosRequestConfig,
    query?: BaseQuery,
    fullUrl?: string
) {
    const apiClient = new ApiClient<Video, PaginationType.Cursor>(
        "/videos/videos/recommendations/",
        DATE_FIELDS
    );
    return apiClient.getAll(requestConfig, query, fullUrl);
}

export function popular(
    requestConfig?: AxiosRequestConfig,
    query?: BaseQuery,
    fullUrl?: string
) {
    const apiClient = new ApiClient<Video, PaginationType.Cursor>(
        "/videos/videos/popular/",
        DATE_FIELDS
    );
    return apiClient.getAll(requestConfig, query, fullUrl);
}

export function latest(
    requestConfig?: AxiosRequestConfig,
    query?: BaseQuery,
    fullUrl?: string
) {
    const apiClient = new ApiClient<Video, PaginationType.Cursor>(
        "/videos/videos/latest/",
        DATE_FIELDS
    );
    return apiClient.getAll(requestConfig, query, fullUrl);
}

export function search(
    searchQuery: string,
    query?: BaseQuery,
    fullUrl?: string
) {
    const apiClient = new ApiClient<Video, PaginationType.Cursor>(
        "/videos/videos/search/",
        DATE_FIELDS
    );
    return apiClient.getAll({ params: { query: searchQuery } }, query, fullUrl);
}

export function following(
    requestConfig?: AxiosRequestConfig,
    query?: BaseQuery,
    fullUrl?: string
) {
    const apiClient = new ApiClient<Video, PaginationType.Cursor>(
        "/videos/videos/following/",
        DATE_FIELDS
    );
    return apiClient.getAll(requestConfig, query, fullUrl);
}

export type GetAllResponseCursorPagination = GenericGetAllResponse<
    Video,
    PaginationType.Cursor
>;
