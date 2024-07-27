import { HttpHandler } from "msw";
import { CommentReportReason, db, getOwnProfile } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(
    db.commentReport,
    BASE_URL + "/videos/comment_reports"
);

const handlers: HttpHandler[] = [
    generator.create(
        ({
            comment: commentId,
            reason,
        }: {
            comment: number;
            reason: CommentReportReason;
        }) => {
            const comment = db.comment.findFirst({
                where: { id: { equals: commentId } },
            });
            if (!comment) throw "Comment not found";

            return { comment, profile: getOwnProfile(), reason };
        }
    ),
];

export default handlers;
