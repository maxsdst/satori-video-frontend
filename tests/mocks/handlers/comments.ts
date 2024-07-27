import { HttpHandler } from "msw";
import { db, getOwnProfile } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(
    db.comment,
    BASE_URL + "/videos/comments"
);

const handlers: HttpHandler[] = [
    generator.create(
        ({
            video: videoId,
            parent: parentId,
            mentioned_profile: mentionedProfileId,
            text,
        }: {
            video: number;
            parent: number | null;
            mentioned_profile: number | null;
            text: string;
        }) => {
            const video = db.video.findFirst({
                where: { id: { equals: videoId } },
            });
            if (!video) throw "Video not found";

            const parent = parentId
                ? db.comment.findFirst({
                      where: { id: { equals: parentId } },
                  })
                : null;
            if (parentId && !parent) throw "Parent comment not found";

            const mentionedProfile = mentionedProfileId
                ? db.profile.findFirst({
                      where: { id: { equals: mentionedProfileId } },
                  })
                : null;
            if (mentionedProfileId && !mentionedProfile)
                throw "Mentioned profile not found";

            return {
                profile: getOwnProfile(),
                video: video.id,
                parent: parent ? parent.id : null,
                mentioned_profile: mentionedProfile
                    ? mentionedProfile.id
                    : null,
                mentioned_profile_username: mentionedProfile
                    ? mentionedProfile.user!.username
                    : null,
                text,
            };
        }
    ),
    generator.retrieve(),
    generator.update(({ text }: { text: string }) => {
        return { text };
    }),
    generator.destroy(),
    generator.list("cursor", (queryParams) => {
        const videoId = queryParams.get("video");
        const parentId = queryParams.get("parent");

        return {
            video: videoId ? { equals: parseInt(videoId) } : undefined,
            parent: parentId ? { equals: parseInt(parentId) } : undefined,
        };
    }),
];

export default handlers;
