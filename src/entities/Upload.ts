import Video from "./Video";

export default interface Upload {
    id: number;
    profile: number;
    video: Video | null;
    is_done: boolean;
}
