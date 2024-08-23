import { HttpStatusCode } from "axios";
import { HttpHandler, HttpResponse, http } from "msw";
import { db, getOwnProfile } from "../db";
import { BASE_URL } from "./constants";
import { paginateResults } from "./HandlerGenerator";

const handlers: HttpHandler[] = [
    http.get(BASE_URL + "/profiles/profiles/me/", () => {
        const profile = getOwnProfile();
        return HttpResponse.json(profile);
    }),

    http.patch(BASE_URL + "/profiles/profiles/me/", async ({ request }) => {
        const data = await request.formData();
        const fullName = data.get("full_name") as string;
        const description = data.get("description") as string;
        const avatar = (data.get("avatar") as File)?.name;

        const profile = db.profile.update({
            where: { id: { equals: getOwnProfile().id } },
            data: { full_name: fullName, description, avatar },
        });

        return HttpResponse.json(profile);
    }),

    http.get(
        BASE_URL + "/profiles/profiles/retrieve_by_username/:username",
        ({ params }) => {
            const username = params["username"] as string;

            const profile = db.profile.findFirst({
                where: { user: { username: { equals: username } } },
            });

            if (!profile)
                return new HttpResponse(null, {
                    status: HttpStatusCode.NotFound,
                });

            return HttpResponse.json(profile);
        }
    ),

    http.get(BASE_URL + "/profiles/profiles/search/", ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        const searchQuery = searchParams.get("query") || "";
        const profiles = db.profile.findMany({
            where: { full_name: { contains: searchQuery } },
        });
        const response = paginateResults(request, "cursor", profiles);
        return HttpResponse.json(response);
    }),
];

export default handlers;
