import Like, { DATE_FIELDS } from "../entities/Like";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";

export const LIKES_CACHE_KEY = "likes";

export default new ApiClient<Like>("/videos/likes/", DATE_FIELDS);

export type GetAllResponse = GenericGetAllResponse<Like, PaginationType.Cursor>;

export function removeLike(videoId: number) {
    const apiClient = new ApiClient<null>("/videos/likes/remove_like/");
    return apiClient.post({ video: videoId });
}
