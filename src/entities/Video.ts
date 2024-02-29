import Profile from "./Profile";

export default interface Video {
    id: number;
    profile: Profile;
    upload_date: Date;
    title: string;
    description: string;
    source: string;
    thumbnail: string;
    first_frame: string;
    view_count: number;
    like_count: number;
    is_liked: boolean;
    comment_count: number;
    is_saved: boolean;
}

export const DATE_FIELDS = ["upload_date"];
