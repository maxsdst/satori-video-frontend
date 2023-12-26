import Profile from "./Profile";

export default interface Comment {
    id: number;
    video: number;
    profile: Profile;
    parent: number;
    text: string;
    creation_date: Date;
    reply_count: number;
    like_count: number;
    is_liked: boolean;
}

export const DATE_FIELDS = ["creation_date"];
