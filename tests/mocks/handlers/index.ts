import { HttpHandler } from "msw";
import auth from "./auth";
import comments from "./comments";
import events from "./events";
import likes from "./likes";
import notifications from "./notifications";
import profiles from "./profiles";
import reports from "./reports";
import savedVideos from "./savedVideos";
import videos from "./videos";

const handlers: HttpHandler[] = [
    ...auth,
    ...profiles,
    ...videos,
    ...likes,
    ...reports,
    ...comments,
    ...savedVideos,
    ...events,
    ...notifications,
];

export default handlers;
