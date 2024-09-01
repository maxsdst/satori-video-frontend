import { http, HttpHandler, HttpResponse } from "msw";
import { db, getOwnProfile } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(db.upload, BASE_URL + "/videos/uploads");

const handlers: HttpHandler[] = [
    http.post(BASE_URL + "/videos/uploads", async ({ request }) => {
        const data = await request.formData();
        const filename = (data.get("file") as File)?.name;

        const upload = db.upload.create({
            profile: getOwnProfile().id,
            filename,
            is_done: false,
        });

        return HttpResponse.json(upload);
    }),

    generator.retrieve(),

    generator.list("limit_offset", (queryParams) => {
        const filenameContains = queryParams.get("filename__icontains");
        const isDone = queryParams.get("is_done");
        return {
            filename: filenameContains
                ? { contains: filenameContains }
                : undefined,
            is_done: isDone
                ? { equals: isDone === "true" ? true : false }
                : undefined,
        };
    }),
];

export default handlers;
