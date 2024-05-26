import { DateFields } from "../services/ApiClient";
import Video, { DATE_FIELDS as VIDEO_DATE_FIELDS } from "./Video";

export default interface SavedVideo {
    id: number;
    video: Video;
    profile: number;
    creation_date: Date;
}

export const DATE_FIELDS: DateFields<SavedVideo> = {
    own: ["creation_date"],
    nested: {
        video: VIDEO_DATE_FIELDS,
    },
};
