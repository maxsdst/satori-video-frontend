import User from "./User";

export default interface Profile {
    id: number;
    user: User;
    full_name: string;
    description: string;
    avatar: string | null;
    following_count: number;
    follower_count: number;
    is_following: boolean;
}
