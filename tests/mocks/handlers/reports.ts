import { HttpHandler } from "msw";
import { ReportReason, db, getOwnProfile } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(db.report, BASE_URL + "/videos/reports");

const handlers: HttpHandler[] = [
    generator.create(
        ({
            video: videoId,
            reason,
        }: {
            video: number;
            reason: ReportReason;
        }) => {
            const video = db.video.findFirst({
                where: { id: { equals: videoId } },
            });
            if (!video) throw "Video not found";

            return { video, profile: getOwnProfile(), reason };
        }
    ),
];

export default handlers;
