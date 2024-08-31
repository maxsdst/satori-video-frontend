import { HttpHandler } from "msw";
import { db } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(db.upload, BASE_URL + "/videos/uploads");

const handlers: HttpHandler[] = [
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
