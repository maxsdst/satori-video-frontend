import { HttpHandler } from "msw";
import { EventType, db } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(db.event, BASE_URL + "/videos/events");

const handlers: HttpHandler[] = [
    generator.create(
        ({ video: videoId, type }: { video: number; type: EventType }) => {
            const video = db.video.findFirst({
                where: { id: { equals: videoId } },
            });
            if (!video) throw "Video not found";

            return { video, type };
        }
    ),
];

export default handlers;
