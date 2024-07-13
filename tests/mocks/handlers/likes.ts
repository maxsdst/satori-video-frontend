import { HttpHandler, HttpResponse, http } from "msw";
import { db, getOwnProfile } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(db.like, BASE_URL + "/videos/likes");

const handlers: HttpHandler[] = [
    generator.create(({ video: videoId }: { video: number }) => {
        const video = db.video.findFirst({
            where: { id: { equals: videoId } },
        });
        if (!video) throw "Video not found";

        db.video.update({
            where: { id: { equals: video.id } },
            data: { is_liked: true },
        });

        return {
            profile: getOwnProfile(),
            video,
        };
    }),
    http.post(BASE_URL + "/videos/likes/remove_like/", async ({ request }) => {
        const data = (await request.json()) as { video: number };
        const videoId = data.video;

        db.like.delete({
            where: {
                video: { id: { equals: videoId } },
                profile: { id: { equals: getOwnProfile().id } },
            },
        });
        db.video.update({
            where: { id: { equals: videoId } },
            data: { is_liked: false },
        });

        return new HttpResponse(null, { status: 200 });
    }),
];

export default handlers;
