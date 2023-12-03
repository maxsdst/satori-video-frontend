import Profile from "./Profile";
import Video from "./Video";

export default interface Like {
    id: number;
    video: Video;
    profile: Profile;
    creation_date: Date;
}

export const DATE_FIELDS = ["creation_date"];
