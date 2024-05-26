import { DateFields } from "../services/ApiClient";
import Video, { DATE_FIELDS as VIDEO_DATE_FIELDS } from "./Video";

export default interface Upload {
    id: number;
    profile: number;
    creation_date: Date;
    filename: string;
    video: Video | null;
    is_done: boolean;
}

export const DATE_FIELDS: DateFields<Upload> = {
    own: ["creation_date"],
    nested: {
        video: VIDEO_DATE_FIELDS,
    },
};
