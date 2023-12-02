import Video, { DATE_FIELDS } from "../entities/Video";
import ApiClient from "./ApiClient";

export default new ApiClient<Video>("/videos/videos/", DATE_FIELDS);
