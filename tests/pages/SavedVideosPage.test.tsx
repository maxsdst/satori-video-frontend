import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Video from "../../src/entities/Video";
import { db, getOwnProfile } from "../mocks/db";
import {
    createVideo,
    createVideos,
    isVideoSaved,
    navigateTo,
    simulateScrollToEnd,
    simulateUnauthenticated,
} from "../utils";

describe("SavedVideosPage", () => {
    const VIDEO_SEQUENCE_PAGE_SIZE = 10;

    describe("loading", () => {
        it("should show spinner while loading", () => {
            const { getSpinner } = navigateToPage();

            expect(getSpinner()).toBeInTheDocument();
        });

        it("should hide spinner after loading is complete", async () => {
            const { waitForDataToLoad, getSpinner } = navigateToPage();
            await waitForDataToLoad();

            expect(getSpinner()).not.toBeInTheDocument();
        });
    });

    describe("unauthenticated", () => {
        it("should redirect to '/login' if user is unauthenticated", async () => {
            simulateUnauthenticated();
            const { waitForDataToLoad, getLocation } = navigateToPage();
            expect(getLocation().pathname).not.toBe("/login");

            await waitForDataToLoad();

            expect(getLocation().pathname).toBe("/login");
        });
    });

    describe("video grid", () => {
        it("should render video grid with videos from saved", async () => {
            createVideos(3, {}); // other videos
            const videos = createVideos(3, {});
            saveVideos(videos);
            const { waitForDataToLoad, getItems } = navigateToPage();
            await waitForDataToLoad();

            const items = getItems();
            expect(items.length).toBe(3);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(videos[index].title)
            );
        });

        it("should render avatars and usernames", async () => {
            const videos = createVideos(3, {});
            saveVideos(videos);
            const { waitForDataToLoad, getItems, getItemComponents } =
                navigateToPage();
            await waitForDataToLoad();

            const items = getItems();
            items.forEach((item) => {
                const { authorAvatar, authorUsername } =
                    getItemComponents(item);
                expect(authorAvatar).toBeInTheDocument();
                expect(authorUsername).toBeInTheDocument();
            });
        });

        it("should redirect to the video page with videos from saved when an item is clicked", async () => {
            createVideos(3, {}); // other videos
            const videos = createVideos(3, {});
            saveVideos(videos);
            const {
                waitForDataToLoad,
                getLocation,
                getItems,
                getItemComponents,
                getPlayers,
                user,
            } = navigateToPage();
            await waitForDataToLoad();
            const pathname = `/videos/${videos[0].id}`;
            expect(getLocation().pathname).not.toBe(pathname);

            const item = getItems()[0];
            await user.click(getItemComponents(item).thumbnail!);

            expect(getLocation().pathname).toBe(pathname);
            const players = getPlayers();
            players.forEach((player, index) =>
                expect(player).toHaveTextContent(videos[index].title)
            );
        });

        it("should load more videos on scroll", async () => {
            const videos = createVideos(VIDEO_SEQUENCE_PAGE_SIZE * 3, {});
            saveVideos(videos);
            const { waitForDataToLoad, getItems, scrollVideos } =
                navigateToPage();
            await waitForDataToLoad();
            let items = getItems();
            expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(videos[index].title)
            );

            await scrollVideos();
            await waitFor(() => {
                items = getItems();
                expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE * 2);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(videos[index].title)
                );
            });

            await scrollVideos();
            await waitFor(() => {
                items = getItems();
                expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE * 3);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(videos[index].title)
                );
            });
        });
    });

    describe("action menu", () => {
        it("should render action menu buttons", async () => {
            const videos = createVideos(3, {});
            saveVideos(videos);
            const { waitForDataToLoad, getItems, getItemComponents } =
                navigateToPage();
            await waitForDataToLoad();

            const items = getItems();
            items.forEach((item) => {
                expect(
                    getItemComponents(item).actionMenuButton
                ).toBeInTheDocument();
            });
        });

        it("should render the menu correctly", async () => {
            const videos = createVideos(1, {});
            saveVideos(videos);
            const {
                waitForDataToLoad,
                getItems,
                openActionMenu,
                getActionMenu,
            } = navigateToPage();
            await waitForDataToLoad();
            await openActionMenu(getItems()[0]);

            const { removeFromSavedItem } = getActionMenu();
            expect(removeFromSavedItem).toBeInTheDocument();
        });

        it("should remove video from saved when the remove from saved item is clicked", async () => {
            const video = createVideo({});
            saveVideos([video]);
            const {
                waitForDataToLoad,
                getItems,
                openActionMenu,
                getActionMenu,
                user,
            } = navigateToPage();
            await waitForDataToLoad();
            await openActionMenu(getItems()[0]);
            expect(isVideoSaved(video.id)).toBe(true);

            await user.click(getActionMenu().removeFromSavedItem!);

            expect(isVideoSaved(video.id)).toBe(false);
        });

        it("should remove video from the grid when the remove from saved item is clicked", async () => {
            const videos = createVideos(3, {});
            saveVideos(videos);
            const {
                waitForDataToLoad,
                getItems,
                openActionMenu,
                getActionMenu,
                user,
            } = navigateToPage();
            await waitForDataToLoad();
            let items = getItems();
            await openActionMenu(items[1]);
            expect(items.length).toBe(3);

            await user.click(getActionMenu().removeFromSavedItem!);

            items = getItems();
            expect(items.length).toBe(2);
            expect(items[0]).toHaveTextContent(videos[0].title);
            expect(items[1]).toHaveTextContent(videos[2].title);
        });
    });
});

function navigateToPage() {
    const { getLocation } = navigateTo("/saved");

    const getSpinner = () => screen.queryByRole("progressbar");

    const getItems = () => screen.queryAllByTestId("video-grid-item");
    const getItemComponents = (item: HTMLElement) => {
        return {
            thumbnail: within(item).queryByRole("img", { name: /thumbnail/i }),
            authorAvatar: within(item).queryByRole("img", { name: /avatar/i }),
            authorUsername: within(item).queryByLabelText(/username/i),
            likeCount: within(item).queryByLabelText(/likes/i),
            actionMenuButton: within(item).queryByRole("button", {
                name: /action menu/i,
            }),
        };
    };

    const getActionMenu = () => {
        const menu = screen.queryByRole("menu", { name: /actions/i });
        return {
            menu,
            removeFromSavedItem:
                menu &&
                within(menu).queryByRole("menuitem", {
                    name: /remove from saved/i,
                }),
        };
    };

    const getPlayers = () => screen.queryAllByTestId("player");

    const user = userEvent.setup();

    const waitForDataToLoad = () =>
        waitFor(
            () => {
                try {
                    expect(getSpinner()).not.toBeInTheDocument();
                } catch {
                    expect(getItems()[0]).toBeInTheDocument();
                }
            },
            { timeout: 3000 }
        );

    const scrollVideos = () => simulateScrollToEnd();

    const openActionMenu = (item: HTMLElement) =>
        user.click(getItemComponents(item).actionMenuButton!);

    return {
        getLocation,
        getSpinner,
        waitForDataToLoad,
        getItems,
        getItemComponents,
        getActionMenu,
        getPlayers,
        user,
        scrollVideos,
        openActionMenu,
    };
}

function saveVideos(videos: Video[]) {
    videos.forEach((video) =>
        db.savedVideo.create({ video, profile: getOwnProfile().id })
    );
}
