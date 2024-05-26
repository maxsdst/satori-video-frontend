import { DateFields } from "../services/ApiClient";
import Profile from "./Profile";

export default interface Comment {
    id: number;
    video: number;
    profile: Profile;
    mentioned_profile: number | null;
    mentioned_profile_username: string | null;
    parent: number | null;
    text: string;
    creation_date: Date;
    reply_count: number;
    like_count: number;
    is_liked: boolean;
}

export const DATE_FIELDS: DateFields<Comment> = { own: ["creation_date"] };
