import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { setRecommendedVideos } from "../mocks/db";
import { createVideos, navigateTo, simulateScrollToEnd } from "../utils";

describe("HomePage", () => {
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

    describe("video grid", () => {
        it("should render video grid with videos from recommended", async () => {
            createVideos(3, {}); // other videos
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
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
            setRecommendedVideos(videos);
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

        it("should render like counts", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, getItems, getItemComponents } =
                navigateToPage();
            await waitForDataToLoad();

            const items = getItems();
            items.forEach((item) =>
                expect(getItemComponents(item).likeCount).toBeInTheDocument()
            );
        });

        it("should redirect to the video page with videos from recommended when an item is clicked", async () => {
            createVideos(3, {}); // other videos
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
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
            setRecommendedVideos(videos);
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
});

function navigateToPage() {
    const { getLocation } = navigateTo("/");

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

    return {
        getLocation,
        getSpinner,
        waitForDataToLoad,
        getItems,
        getItemComponents,
        getPlayers,
        user,
        scrollVideos,
    };
}
