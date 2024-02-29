import Video from "./Video";

export default interface SavedVideo {
    id: number;
    video: Video;
    profile: number;
    creation_date: Date;
}

export const DATE_FIELDS = ["creation_date"];
