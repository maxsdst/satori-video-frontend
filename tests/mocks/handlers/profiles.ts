import { HttpStatusCode } from "axios";
import { HttpHandler, HttpResponse, http } from "msw";
import { db, getOwnProfile } from "../db";
import { BASE_URL } from "./constants";

const handlers: HttpHandler[] = [
    http.get(BASE_URL + "/profiles/profiles/me/", () => {
        const profile = getOwnProfile();
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
];

export default handlers;
