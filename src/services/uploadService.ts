import Upload, { DATE_FIELDS } from "../entities/Upload";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";

export const UPLOADS_CACHE_KEY = "uploads";

const uploadApiClient = new ApiClient<Upload, PaginationType.LimitOffset>(
    "/videos/uploads/",
    DATE_FIELDS
);

export type GetAllResponse = GenericGetAllResponse<
    Upload,
    PaginationType.LimitOffset
>;

interface CreateUploadData {
    file: File;
}

const originalUploadApiClientPost = uploadApiClient.post;

uploadApiClient.post = (data: CreateUploadData, ...args) => {
    const form = new FormData();
    let key: keyof CreateUploadData;
    for (key in data) {
        if (data[key] !== undefined) form.append(key, data[key]);
    }
    return originalUploadApiClientPost(form, ...args);
};

export default uploadApiClient;
