/* eslint-disable @typescript-eslint/no-explicit-any */
import { drop } from "@mswjs/data";
import "@testing-library/jest-dom/vitest";
import { PropertySymbol } from "happy-dom";
import {
    db,
    deleteOwnProfile,
    resetFollowedProfiles,
    resetFollowers,
    setFollowingVideos,
    setLatestVideos,
    setPopularVideos,
    setRecommendedVideos,
} from "./mocks/db";
import { server } from "./mocks/server";

afterEach(() => {
    vi.restoreAllMocks();
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

afterEach(() => drop(db));
afterEach(() => {
    deleteOwnProfile();
    resetFollowedProfiles();
    resetFollowers();
    setRecommendedVideos([]);
    setPopularVideos([]);
    setLatestVideos([]);
    setFollowingVideos([]);
});

vi.mock("react-player/lazy", () => {
    return vi.importActual("react-player");
});

vi.mock("@chakra-ui/react", async (importOriginal) => {
    const mod = await importOriginal<typeof import("@chakra-ui/react")>();
    return {
        ...mod,
        Avatar: (props: any) => {
            return <img {...props} />;
        },
    };
});

HTMLMediaElement.prototype.play = vi.fn(async function (
    this: HTMLMediaElement
) {
    Object.defineProperty(this, PropertySymbol.paused, { value: false });
    this.dispatchEvent(
        new Event("play", { bubbles: false, cancelable: false })
    );
    simulatePlayback(this);
    return Promise.resolve();
});

Object.defineProperty(HTMLMediaElement.prototype, "src", {
    set: function (this: HTMLMediaElement, src: string) {
        this.setAttribute("src", src);

        if (!src) return;

        setTimeout(() => {
            const durationSeconds = 60;
            Object.defineProperty(this, PropertySymbol.duration, {
                value: durationSeconds,
            });
            this.dispatchEvent(
                new Event("durationchange", {
                    bubbles: false,
                    cancelable: false,
                })
            );

            this.dispatchEvent(
                new Event("canplay", { bubbles: false, cancelable: false })
            );
        }, 0);
    },
});

function simulatePlayback(mediaElement: HTMLMediaElement) {
    const intervalSeconds = 0.1;

    setTimeout(() => {
        if (
            mediaElement.currentTime + intervalSeconds >=
            mediaElement.duration
        ) {
            mediaElement.currentTime = mediaElement.duration;
            Object.defineProperty(mediaElement, PropertySymbol.ended, {
                value: true,
            });
        } else {
            mediaElement.currentTime += intervalSeconds;
            simulatePlayback(mediaElement);
        }
    }, intervalSeconds * 1000);
}

Navigator.prototype.share = vi.fn();
