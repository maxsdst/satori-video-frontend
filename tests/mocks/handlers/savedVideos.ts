import { HttpHandler, HttpResponse, http } from "msw";
import { db, getOwnProfile } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(
    db.savedVideo,
    BASE_URL + "/videos/saved_videos"
);

const handlers: HttpHandler[] = [
    generator.create(({ video: videoId }: { video: number }) => {
        const video = db.video.findFirst({
            where: { id: { equals: videoId } },
        });
        if (!video) throw "Video not found";

        db.video.update({
            where: { id: { equals: video.id } },
            data: { is_saved: true },
        });

        return {
            profile: getOwnProfile().id,
            video,
        };
    }),
    http.post(
        BASE_URL + "/videos/saved_videos/remove_video_from_saved/",
        async ({ request }) => {
            const data = (await request.json()) as { video: number };
            const videoId = data.video;

            db.savedVideo.delete({
                where: {
                    video: { id: { equals: videoId } },
                    profile: { equals: getOwnProfile().id },
                },
            });
            db.video.update({
                where: { id: { equals: videoId } },
                data: { is_saved: false },
            });

            return new HttpResponse(null, { status: 200 });
        }
    ),
];

export default handlers;
