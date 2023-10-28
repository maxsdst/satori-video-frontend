import Video from "./Video";

export default interface Upload {
    id: number;
    profile: number;
    creation_date: Date;
    filename: string;
    video: Video | null;
    is_done: boolean;
}
