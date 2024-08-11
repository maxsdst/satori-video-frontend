/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RenderResult, act, fireEvent, render } from "@testing-library/react";
import { HttpStatusCode } from "axios";
import { HttpResponse, http } from "msw";
import { ReactNode } from "react";
import * as reactDeviceDetect from "react-device-detect";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { routes as appRoutes } from "../../src/routes";
import * as utils from "../../src/utils";
import AllProviders from "../AllProviders";
import { BASE_URL } from "../mocks/handlers/constants";
import { server } from "../mocks/server";

export function renderWithRouter(ui: ReactNode, useAppRoutes?: boolean) {
    let router: ReturnType<typeof createMemoryRouter>;

    function initRouter(testRouteElement: ReactNode) {
        const testRoute = {
            path: "/test-route",
            element: testRouteElement,
        };

        const routes = useAppRoutes ? [testRoute, ...appRoutes] : [testRoute];
        router = createMemoryRouter(routes, {
            initialEntries: [testRoute.path],
            initialIndex: 1,
        });
    }

    initRouter(ui);
    const renderResult: RenderResult = render(
        <RouterProvider router={router!} />,
        {
            wrapper: AllProviders,
        }
    );

    return {
        ...renderResult,
        rerender: (ui: ReactNode) => {
            initRouter(ui);
            renderResult.rerender(<RouterProvider router={router} />);
        },
        getLocation: () => router.state.location,
    };
}

export const navigateTo = (path: string, state?: any) => {
    const router = createMemoryRouter(appRoutes, {
        initialEntries: [{ pathname: path, state }],
    });

    render(<RouterProvider router={router} />, { wrapper: AllProviders });

    return {
        getLocation: () => router.state.location,
    };
};

export function simulateUnauthenticated() {
    server.use(
        http.get(
            BASE_URL + "/profiles/profiles/me/",
            () =>
                new HttpResponse(null, { status: HttpStatusCode.Unauthorized })
        )
    );
}

interface SimulateErrorOptions {
    body?: Record<string, any>;
    statusCode?: number;
}

export const simulateError = (
    endpoint: string,
    method: "post" | "get" | "patch" | "delete",
    { body, statusCode }: SimulateErrorOptions
) => {
    server.use(
        http[method](endpoint, () =>
            HttpResponse.json(body, {
                status: statusCode ?? HttpStatusCode.BadRequest,
            })
        )
    );
};

export async function simulateMobileDevice(
    callback: () => void | Promise<void>
) {
    const originalValue = reactDeviceDetect.isMobile;

    try {
        // @ts-ignore
        reactDeviceDetect.isMobile = true;
        await callback();
    } finally {
        // @ts-ignore
        reactDeviceDetect.isMobile = originalValue;
    }
}

export function simulateTouchDevice() {
    vi.spyOn(utils, "isTouchDevice").mockReturnValue(true);
}

export async function simulateSwipe(
    element: HTMLElement,
    direction: "up" | "down"
) {
    const SWIPE_MIN_DISTANCE_PX = 10;

    const startY = direction === "up" ? SWIPE_MIN_DISTANCE_PX : 0;
    const endY = direction === "up" ? 0 : SWIPE_MIN_DISTANCE_PX;

    fireEvent(
        element,
        new MouseEvent("touchstart", {
            clientX: 0,
            clientY: startY,
        })
    );

    await sleep(10);

    fireEvent(
        element,
        new MouseEvent("touchend", {
            clientX: 0,
            clientY: endY,
        })
    );
}

export function simulateTooLongText() {
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(
        () => 10000
    );
}

export async function simulateScrollToEnd(element: HTMLElement) {
    Object.defineProperties(element, {
        scrollHeight: { value: 1000 },
        clientHeight: { value: 300 },
        scrollTop: { value: 700 },
    });

    await act(async () => {
        fireEvent(element, new Event("scroll"));
        await new Promise((r) => setTimeout(r, 0));
    });
}

export function replaceQueryParam(url: string, name: string, value: string) {
    const urlObj = new URL(url);
    urlObj.searchParams.set(name, value);
    return urlObj.toString();
}

export function sleep(ms: number) {
    return act(() => new Promise((r) => setTimeout(r, ms)));
}
