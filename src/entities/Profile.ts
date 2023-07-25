import User from "./User";

export default interface Profile {
    id: number;
    user: User;
    full_name: string;
    description: string;
    avatar: string | null;
}
