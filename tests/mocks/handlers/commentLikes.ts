import { HttpHandler, HttpResponse, http } from "msw";
import { db, getOwnProfile } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(
    db.commentLike,
    BASE_URL + "/videos/comment_likes"
);

const handlers: HttpHandler[] = [
    generator.create(({ comment: commentId }: { comment: number }) => {
        const comment = db.comment.findFirst({
            where: { id: { equals: commentId } },
        });
        if (!comment) throw "Comment not found";

        db.comment.update({
            where: { id: { equals: comment.id } },
            data: { is_liked: true },
        });

        return {
            profile: getOwnProfile().id,
            comment: comment.id,
        };
    }),
    http.post(
        BASE_URL + "/videos/comment_likes/remove_like/",
        async ({ request }) => {
            const data = (await request.json()) as { comment: number };
            const commentId = data.comment;

            db.commentLike.delete({
                where: {
                    comment: { equals: commentId },
                    profile: { equals: getOwnProfile().id },
                },
            });
            db.comment.update({
                where: { id: { equals: commentId } },
                data: { is_liked: false },
            });

            return new HttpResponse(null, { status: 200 });
        }
    ),
];

export default handlers;
