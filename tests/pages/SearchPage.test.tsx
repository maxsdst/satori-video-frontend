import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { BASE_URL } from "../mocks/handlers/constants";
import {
    createProfiles,
    createVideos,
    navigateTo,
    simulateDelay,
    simulateScrollToEnd,
} from "../utils";

describe("SearchPage", () => {
    const VIDEO_SEQUENCE_PAGE_SIZE = 10;
    const USERS_PAGE_SIZE = 20;

    describe("tabs", () => {
        it("should render tabs", () => {
            const { videosTab, usersTab } = navigateToPage("a");

            expect(videosTab).toBeInTheDocument();
            expect(usersTab).toBeInTheDocument();
        });

        it("should have the videos tab active initially", () => {
            const { getVideosTabPanel, getUsersTabPanel } = navigateToPage("a");

            expect(getVideosTabPanel().panel).toBeInTheDocument();
            expect(getUsersTabPanel().panel).not.toBeInTheDocument();
        });

        it("should show the videos tab panel when the videos tab is clicked", async () => {
            const { videosTab, getVideosTabPanel, switchToUsersTab, user } =
                navigateToPage("a");
            await switchToUsersTab();
            expect(getVideosTabPanel().panel).not.toBeInTheDocument();

            await user.click(videosTab);

            expect(getVideosTabPanel().panel).toBeInTheDocument();
        });

        it("should show the users tab panel when the users tab is clicked", async () => {
            const { usersTab, getUsersTabPanel, user } = navigateToPage("a");
            expect(getUsersTabPanel().panel).not.toBeInTheDocument();

            await user.click(usersTab);

            expect(getUsersTabPanel().panel).toBeInTheDocument();
        });
    });

    describe("videos tab", () => {
        it("should show spinner while loading", () => {
            const { getVideosTabPanel } = navigateToPage("a");

            expect(getVideosTabPanel().spinner).toBeInTheDocument();
        });

        it("should hide spinner after loading is complete", async () => {
            const { waitForDataToLoad, getVideosTabPanel } =
                navigateToPage("a");
            await waitForDataToLoad();

            expect(getVideosTabPanel().spinner).not.toBeInTheDocument();
        });

        it("should render video grid with videos from search", async () => {
            createVideos(3, {}); // other videos
            const query = "test123";
            const videos = createVideos(3, { titlePrefix: query });
            const { waitForDataToLoad, getVideosTabPanel } =
                navigateToPage(query);
            await waitForDataToLoad();

            const { items } = getVideosTabPanel();
            expect(items.length).toBe(3);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(videos[index].title)
            );
        });

        it("should render avatars and usernames", async () => {
            const query = "test123";
            createVideos(3, { titlePrefix: query });
            const {
                waitForDataToLoad,
                getVideosTabPanel,
                getVideoItemComponents,
            } = navigateToPage(query);
            await waitForDataToLoad();

            const { items } = getVideosTabPanel();
            items.forEach((item) => {
                const { authorAvatar, authorUsername } =
                    getVideoItemComponents(item);
                expect(authorAvatar).toBeInTheDocument();
                expect(authorUsername).toBeInTheDocument();
            });
        });

        it("should render like counts", async () => {
            const query = "test123";
            createVideos(3, { titlePrefix: query });
            const {
                waitForDataToLoad,
                getVideosTabPanel,
                getVideoItemComponents,
            } = navigateToPage(query);
            await waitForDataToLoad();

            const { items } = getVideosTabPanel();
            items.forEach((item) =>
                expect(
                    getVideoItemComponents(item).likeCount
                ).toBeInTheDocument()
            );
        });

        it("should redirect to the video page with videos from search when an item is clicked", async () => {
            createVideos(3, {}); // other videos
            const query = "test123";
            const videos = createVideos(3, { titlePrefix: query });
            const {
                getLocation,
                waitForDataToLoad,
                getVideosTabPanel,
                getVideoItemComponents,
                getPlayers,
                user,
            } = navigateToPage(query);
            await waitForDataToLoad();
            const pathname = `/videos/${videos[0].id}`;
            expect(getLocation().pathname).not.toBe(pathname);

            const item = getVideosTabPanel().items[0];
            await user.click(getVideoItemComponents(item).thumbnail!);

            expect(getLocation().pathname).toBe(pathname);
            const players = getPlayers();
            players.forEach((player, index) =>
                expect(player).toHaveTextContent(videos[index].title)
            );
        });

        it("should load more videos on scroll", async () => {
            const query = "test123";
            const videos = createVideos(VIDEO_SEQUENCE_PAGE_SIZE * 3, {
                titlePrefix: query,
            });
            const { waitForDataToLoad, getVideosTabPanel, scrollPage } =
                navigateToPage(query);
            await waitForDataToLoad();
            let items = getVideosTabPanel().items;
            expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(videos[index].title)
            );

            await scrollPage();
            await waitFor(() => {
                items = getVideosTabPanel().items;
                expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE * 2);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(videos[index].title)
                );
            });

            await scrollPage();
            await waitFor(() => {
                items = getVideosTabPanel().items;
                expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE * 3);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(videos[index].title)
                );
            });
        });
    });

    describe("users tab", () => {
        it("should show spinner while loading", async () => {
            simulateDelay(BASE_URL + "/profiles/profiles/search/", "get");
            const { switchToUsersTab, getUsersTabPanel } = navigateToPage("a");
            await switchToUsersTab();

            expect(getUsersTabPanel().spinner).toBeInTheDocument();
        });

        it("should hide spinner after loading is complete", async () => {
            const { switchToUsersTab, waitForDataToLoad, getUsersTabPanel } =
                navigateToPage("a");
            await switchToUsersTab();
            await waitForDataToLoad();

            expect(getUsersTabPanel().spinner).not.toBeInTheDocument();
        });

        it("should render user list with users from search", async () => {
            createProfiles(3, {}); // other profiles
            const query = "test123";
            const profiles = createProfiles(3, { fullName: query });
            const { switchToUsersTab, waitForDataToLoad, getUsersTabPanel } =
                navigateToPage(query);
            await switchToUsersTab();
            await waitForDataToLoad();

            const { items } = getUsersTabPanel();
            expect(items.length).toBe(3);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(profiles[index].user.username)
            );
        });

        it("should load more users on scroll", async () => {
            const query = "test123";
            const profiles = createProfiles(USERS_PAGE_SIZE * 3, {
                fullName: query,
            });
            const {
                switchToUsersTab,
                waitForDataToLoad,
                getUsersTabPanel,
                scrollPage,
            } = navigateToPage(query);
            await switchToUsersTab();
            await waitForDataToLoad();
            let items = getUsersTabPanel().items;
            expect(items.length).toBe(USERS_PAGE_SIZE);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(profiles[index].user.username)
            );

            await scrollPage();
            await waitFor(() => {
                items = getUsersTabPanel().items;
                expect(items.length).toBe(USERS_PAGE_SIZE * 2);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        profiles[index].user.username
                    )
                );
            });

            await scrollPage();
            await waitFor(() => {
                items = getUsersTabPanel().items;
                expect(items.length).toBe(USERS_PAGE_SIZE * 3);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        profiles[index].user.username
                    )
                );
            });
        });
    });
});

function navigateToPage(searchQuery: string) {
    const { getLocation } = navigateTo("/search", {
        searchParams: { query: searchQuery },
    });

    const tablist = screen.getByRole("tablist");
    const videosTab = within(tablist).getByRole("tab", { name: /videos/i });
    const usersTab = within(tablist).getByRole("tab", { name: /users/i });

    const getVideosTabPanel = () => {
        const panel = screen.queryByRole("tabpanel", { name: /videos/i });
        return {
            panel,
            spinner: panel && within(panel).queryByRole("progressbar"),
            items: panel
                ? within(panel).queryAllByTestId("video-grid-item")
                : [],
        };
    };

    const getVideoItemComponents = (item: HTMLElement) => {
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

    const getUsersTabPanel = () => {
        const panel = screen.queryByRole("tabpanel", { name: /users/i });
        const userList =
            panel && within(panel).queryByRole("list", { name: /users/i });
        return {
            panel,
            spinner: panel && within(panel).queryByRole("progressbar"),
            items: userList ? within(userList).queryAllByRole("listitem") : [],
        };
    };

    const getPlayers = () => screen.queryAllByTestId("player");

    const user = userEvent.setup();

    const waitForDataToLoad = () =>
        waitFor(() => {
            const videosTabPanel = getVideosTabPanel();
            const usersTabPanel = getUsersTabPanel();
            const tabPanel = videosTabPanel.panel
                ? videosTabPanel
                : usersTabPanel;
            try {
                expect(tabPanel.spinner).not.toBeInTheDocument();
            } catch {
                expect(tabPanel.items[0]).toBeInTheDocument();
            }
        });

    const switchToUsersTab = () => user.click(usersTab);

    const scrollPage = () => simulateScrollToEnd();

    return {
        getLocation,
        videosTab,
        usersTab,
        getVideosTabPanel,
        getVideoItemComponents,
        getUsersTabPanel,
        getPlayers,
        user,
        waitForDataToLoad,
        switchToUsersTab,
        scrollPage,
    };
}
