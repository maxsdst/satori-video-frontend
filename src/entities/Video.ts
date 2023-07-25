import Profile from "./Profile";

export default interface Video {
    id: number;
    profile: Profile;
    title: string;
    description: string;
    source: string;
    thumbnail: string;
}
