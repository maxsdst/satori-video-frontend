import { HttpHandler, HttpResponse, http } from "msw";
import { db } from "../db";
import { BASE_URL } from "./constants";

const handlers: HttpHandler[] = [
    http.get(BASE_URL + "/notifications/notifications/unseen_count/", () => {
        const unseen_count = db.notification.count({
            where: { is_seen: { equals: false } },
        });
        return HttpResponse.json({ unseen_count });
    }),
];

export default handlers;
