import Upload, { DATE_FIELDS } from "../entities/Upload";
import ApiClient from "./ApiClient";

export default new ApiClient<Upload>("/videos/uploads/", DATE_FIELDS);
