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
}
