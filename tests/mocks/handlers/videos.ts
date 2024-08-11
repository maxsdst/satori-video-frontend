import { http, HttpHandler, HttpResponse } from "msw";
import {
    db,
    getFollowingVideos,
    getLatestVideos,
    getPopularVideos,
    getRecommendedVideos,
} from "../db";
import HandlerGenerator, { paginateResults } from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const generator = new HandlerGenerator(db.video, BASE_URL + "/videos/videos");

const handlers: HttpHandler[] = [
    http.get(BASE_URL + "/videos/videos/recommendations/", ({ request }) => {
        const videos = getRecommendedVideos();
        const response = paginateResults(request, "cursor", videos);
        return HttpResponse.json(response);
    }),

    http.get(BASE_URL + "/videos/videos/popular/", ({ request }) => {
        const videos = getPopularVideos();
        const response = paginateResults(request, "cursor", videos);
        return HttpResponse.json(response);
    }),

    http.get(BASE_URL + "/videos/videos/latest/", ({ request }) => {
        const videos = getLatestVideos();
        const response = paginateResults(request, "cursor", videos);
        return HttpResponse.json(response);
    }),

    http.get(BASE_URL + "/videos/videos/following/", ({ request }) => {
        const videos = getFollowingVideos();
        const response = paginateResults(request, "cursor", videos);
        return HttpResponse.json(response);
    }),

    http.get(BASE_URL + "/videos/videos/search/", ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        const searchQuery = searchParams.get("query") || "";
        const videos = db.video.findMany({
            where: { title: { contains: searchQuery } },
        });
        const response = paginateResults(request, "cursor", videos);
        return HttpResponse.json(response);
    }),

    generator.retrieve(),

    generator.list("limit_offset", (queryParams) => {
        const profileId = queryParams.get("profile");
        return {
            profile: profileId
                ? { id: { equals: parseInt(profileId) } }
                : undefined,
        };
    }),
];

export default handlers;
