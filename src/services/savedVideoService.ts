import SavedVideo, { DATE_FIELDS } from "../entities/SavedVideo";
import ApiClient from "./ApiClient";

export const SAVED_VIDEOS_CACHE_KEY = "saved_videos";

export default new ApiClient<SavedVideo>("/videos/saved_videos/", DATE_FIELDS);

export function removeVideoFromSaved(videoId: number) {
    const apiClient = new ApiClient<null>(
        "/videos/saved_videos/remove_video_from_saved/"
    );
    return apiClient.post({ video: videoId });
}
