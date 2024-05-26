import { DateFields } from "../services/ApiClient";
import Profile from "./Profile";
import Video, { DATE_FIELDS as VIDEO_DATE_FIELDS } from "./Video";

export default interface Like {
    id: number;
    video: Video;
    profile: Profile;
    creation_date: Date;
}

export const DATE_FIELDS: DateFields<Like> = {
    own: ["creation_date"],
    nested: {
        video: VIDEO_DATE_FIELDS,
    },
};
