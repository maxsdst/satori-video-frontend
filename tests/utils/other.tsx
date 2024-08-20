/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as chakraUi from "@chakra-ui/react";
import { RenderResult, act, fireEvent, render } from "@testing-library/react";
import { HttpStatusCode } from "axios";
import { Window } from "happy-dom";
import { HttpResponse, delay, http } from "msw";
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

interface NavigateToOptions {
    searchParams?: Record<string, string>;
    state?: any;
}

export const navigateTo = (
    path: string,
    { searchParams, state }: NavigateToOptions = {}
) => {
    const search = searchParams
        ? "?" + new URLSearchParams(searchParams).toString()
        : undefined;

    const router = createMemoryRouter(appRoutes, {
        initialEntries: [{ pathname: path, state, search }],
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

export const simulateDelay = (endpoint: string) => {
    server.use(
        http.get(endpoint, async () => {
            await delay("infinite");
            return new HttpResponse();
        })
    );
};

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

export async function simulateScreenSize(
    size: "sm" | "md" | "lg" | "xl" | "2xl",
    callback: () => void | Promise<void>
) {
    const originalValue = window.innerWidth;

    const width = convertToPx(
        chakraUi.theme.breakpoints[size],
        document.documentElement
    );

    try {
        act(() => {
            (window as unknown as Window).happyDOM.setViewport({ width });
        });
        await callback();
    } finally {
        act(() => {
            (window as unknown as Window).happyDOM.setViewport({
                width: originalValue,
            });
        });
    }
}

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

export async function simulateScrollToEnd(element?: HTMLElement) {
    const target = element || document.documentElement;
    const eventTarget = element || window;

    Object.defineProperties(target, {
        scrollHeight: { value: 1000 },
        clientHeight: { value: 300 },
        scrollTop: { value: 700 },
    });

    await act(async () => {
        fireEvent(eventTarget, new Event("scroll"));
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

function convertToPx(value: string, element: HTMLElement): number {
    const child = document.createElement("div");
    child.style.width = value;
    element.appendChild(child);
    const width = getComputedStyle(child).getPropertyValue("width");
    return parseInt(width.replace("px", ""));
}
