import { HttpHandler } from "msw";
import { db } from "../db";
import HandlerGenerator from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(
    db.comment,
    BASE_URL + "/videos/comments"
);

const handlers: HttpHandler[] = [
    generator.retrieve(),
    generator.list("cursor", (queryParams) => {
        const videoId = queryParams.get("video");
        const parentId = queryParams.get("parent");

        return {
            video: videoId ? { equals: videoId } : undefined,
            parent: parentId ? { equals: parentId } : undefined,
        };
    }),
];

export default handlers;
