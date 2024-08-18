import { HttpHandler, HttpResponse, http } from "msw";
import { db } from "../db";
import { BASE_URL } from "./constants";
import HandlerGenerator from "./HandlerGenerator";

const generator = new HandlerGenerator(
    db.notification,
    BASE_URL + "/notifications/notifications"
);

const handlers: HttpHandler[] = [
    generator.destroy(),

    generator.list("cursor"),

    http.get(BASE_URL + "/notifications/notifications/unseen_count/", () => {
        const unseen_count = db.notification.count({
            where: { is_seen: { equals: false } },
        });
        return HttpResponse.json({ unseen_count });
    }),

    http.post(
        BASE_URL + "/notifications/notifications/mark_as_seen/",
        async ({ request }) => {
            const { notification_ids } = (await request.json()) as {
                notification_ids: number[];
            };
            db.notification.updateMany({
                where: { id: { in: notification_ids } },
                data: { is_seen: true },
            });
            return new HttpResponse(null, { status: 200 });
        }
    ),
];

export default handlers;
