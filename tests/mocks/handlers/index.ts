import { HttpHandler } from "msw";
import comments from "./comments";
import events from "./events";
import likes from "./likes";
import profiles from "./profiles";
import savedVideos from "./savedVideos";
import videos from "./videos";

const handlers: HttpHandler[] = [
    ...profiles,
    ...videos,
    ...likes,
    ...comments,
    ...savedVideos,
    ...events,
];

export default handlers;
