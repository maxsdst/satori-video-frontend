import { HttpHandler } from "msw";
import { db, getOwnProfile } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(db.view, BASE_URL + "/videos/views");

const handlers: HttpHandler[] = [
    generator.create(({ video: videoId }: { video: number }) => {
        const video = db.video.findFirst({
            where: { id: { equals: videoId } },
        });
        if (!video) throw "Video not found";

        return {
            profile: getOwnProfile(),
            video,
        };
    }),
];

export default handlers;
