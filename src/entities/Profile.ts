import User from "./User";

export default interface Profile {
    user: User;
    full_name: string;
    description: string;
    avatar: string | null;
}
