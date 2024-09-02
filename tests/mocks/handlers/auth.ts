import { HttpStatusCode } from "axios";
import { HttpHandler, HttpResponse, http } from "msw";
import Profile from "../../../src/entities/Profile";
import { CORRECT_PASSWORD, db, getOwnProfile, setOwnProfile } from "../db";
import { BASE_URL } from "./constants";

const REFRESH_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJCaWcgSXNzdWVyIiwiaWF0IjoxNzI1MTcxMjE3LCJleHAiOjQxMjM0NjI2MDEsImF1ZCI6Ind3dy5iaWdjb21wYW55LmNvbSIsInN1YiI6ImhhcHB5Y3VzdG9tZXIifQ.mzSCckI4elvmhVGj_dBsiPOVTkNRjWcHe0ZL2G-j408";
const ACCESS_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJCaWcgSXNzdWVyIiwiaWF0IjoxNzI1MTcxMjE3LCJleHAiOjQxMjM0NjI2MDEsImF1ZCI6Ind3dy5iaWdjb21wYW55LmNvbSIsInN1YiI6ImhhcHB5Y3VzdG9tZXIifQ.mzSCckI4elvmhVGj_dBsiPOVTkNRjWcHe0ZL2G-j408";

const handlers: HttpHandler[] = [
    http.post(BASE_URL + "/auth/users/", async ({ request }) => {
        const { email, full_name, username } = (await request.json()) as {
            email: string;
            full_name: string;
            username: string;
            password: string;
        };

        const user = db.user.create({ username });
        const profile = db.profile.create({ user, full_name }) as Profile;
        setOwnProfile(profile);

        return HttpResponse.json({ email, username, id: user.id });
    }),

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

        _didLogIn = true;

        return HttpResponse.json({
            refresh: REFRESH_TOKEN,
            access: ACCESS_TOKEN,
        });
    }),
];

export default handlers;

let _didLogIn: boolean = false;

export function didLogIn() {
    return _didLogIn;
}

export function setDidLogIn(value: boolean) {
    _didLogIn = value;
}
