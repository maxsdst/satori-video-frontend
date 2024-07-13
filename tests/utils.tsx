/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from "@testing-library/react";
import { HttpStatusCode } from "axios";
import { HttpResponse, http } from "msw";
import { ReactNode } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { routes as appRoutes } from "../src/routes";
import AllProviders from "./AllProviders";
import { EventType, db, getOwnProfile } from "./mocks/db";
import { BASE_URL } from "./mocks/handlers/constants";
import { server } from "./mocks/server";

export function renderWithRouter(ui: ReactNode, useAppRoutes?: boolean) {
    const testRoute = {
        path: "/test-route",
        element: ui,
    };

    const routes = useAppRoutes ? [testRoute, ...appRoutes] : [testRoute];
    const router = createMemoryRouter(routes, {
        initialEntries: [testRoute.path],
        initialIndex: 1,
    });

    const renderResult = render(<RouterProvider router={router} />, {
        wrapper: AllProviders,
    });

    return { ...renderResult, getLocation: () => router.state.location };
}

export function simulateUnauthenticated() {
    server.use(
        http.get(
            BASE_URL + "/profiles/profiles/me/",
            () =>
                new HttpResponse(null, { status: HttpStatusCode.Unauthorized })
        )
    );
}

export function isVideoLiked(videoId: number): boolean {
    const ownProfile = getOwnProfile();
    return (
        db.like.count({
            where: {
                video: { id: { equals: videoId } },
                profile: { id: { equals: ownProfile.id } },
            },
        }) > 0
    );
}

export function isVideoSaved(videoId: number): boolean {
    const ownProfile = getOwnProfile();
    return (
        db.savedVideo.count({
            where: {
                video: { id: { equals: videoId } },
                profile: { equals: ownProfile.id },
            },
        }) > 0
    );
}

export function countEvents(videoId: number, type: EventType) {
    return db.event.count({
        where: {
            video: { id: { equals: videoId } },
            type: { equals: type },
        },
    });
}

export function replaceQueryParam(url: string, name: string, value: string) {
    const urlObj = new URL(url);
    urlObj.searchParams.set(name, value);
    return urlObj.toString();
}
