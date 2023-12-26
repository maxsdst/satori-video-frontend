import Comment, { DATE_FIELDS } from "../entities/Comment";
import ApiClient from "./ApiClient";

export default new ApiClient<Comment>("/videos/comments/", DATE_FIELDS);
