import Video, { DATE_FIELDS } from "../entities/Video";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";

export const VIDEOS_CACHE_KEY = "videos";

export default new ApiClient<Video, PaginationType.LimitOffset>(
    "/videos/videos/",
    DATE_FIELDS
);

export type GetAllResponse = GenericGetAllResponse<
    Video,
    PaginationType.LimitOffset
>;
