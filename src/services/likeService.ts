import Like, { DATE_FIELDS } from "../entities/Like";
import ApiClient from "./ApiClient";

export default new ApiClient<Like>("/videos/likes/", DATE_FIELDS);

export function removeLike(videoId: number) {
    const apiClient = new ApiClient<null>("/videos/likes/remove_like/");
    return apiClient.post({ video: videoId });
}
