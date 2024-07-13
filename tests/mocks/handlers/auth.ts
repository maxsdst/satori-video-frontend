import { HttpStatusCode } from "axios";
import { HttpHandler, HttpResponse, http } from "msw";
import { CORRECT_PASSWORD, getOwnProfile } from "../db";
import { BASE_URL } from "./constants";

const REFRESH_TOKEN = "refresh.123";
const ACCESS_TOKEN = "access.123";

const handlers: HttpHandler[] = [
    http.post(BASE_URL + "/auth/jwt/create/", async ({ request }) => {
        const { username, password } = (await request.json()) as {
            username: string;
            password: string;
        };

        const profile = getOwnProfile();

        if (username !== profile.user.username || password !== CORRECT_PASSWORD)
            return HttpResponse.json(
                {
                    detail: "Wrong credentials",
                },
                { status: HttpStatusCode.Unauthorized }
            );

        return HttpResponse.json({
            refresh: REFRESH_TOKEN,
            access: ACCESS_TOKEN,
        });
    }),
];

export default handlers;
