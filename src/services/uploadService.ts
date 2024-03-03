import Upload, { DATE_FIELDS } from "../entities/Upload";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";

export const UPLOADS_CACHE_KEY = "uploads";

export default new ApiClient<Upload, PaginationType.LimitOffset>(
    "/videos/uploads/",
    DATE_FIELDS
);

export type GetAllResponse = GenericGetAllResponse<
    Upload,
    PaginationType.LimitOffset
>;
