import { HttpHandler } from "msw";
import auth from "./auth";
import commentLikes from "./commentLikes";
import commentReports from "./commentReports";
import comments from "./comments";
import events from "./events";
import likes from "./likes";
import notifications from "./notifications";
import profiles from "./profiles";
import reports from "./reports";
import savedVideos from "./savedVideos";
import uploads from "./uploads";
import videos from "./videos";
import views from "./views";

const handlers: HttpHandler[] = [
    ...auth,
    ...profiles,
    ...videos,
    ...uploads,
    ...views,
    ...likes,
    ...reports,
    ...comments,
    ...commentLikes,
    ...commentReports,
    ...savedVideos,
    ...events,
    ...notifications,
];

export default handlers;
