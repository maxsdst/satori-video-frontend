import Comment, { DATE_FIELDS } from "../entities/Comment";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";

export const COMMENTS_CACHE_KEY = "comments";

export default new ApiClient<Comment, PaginationType.Snapshot>(
    "/videos/comments/",
    DATE_FIELDS
);

export type GetAllResponse = GenericGetAllResponse<
    Comment,
    PaginationType.Snapshot
>;
