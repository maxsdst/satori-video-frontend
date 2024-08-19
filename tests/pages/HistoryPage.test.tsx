import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import HistoryEntry from "../../src/entities/HistoryEntry";
import Video from "../../src/entities/Video";
import { db, getOwnProfile } from "../mocks/db";
import {
    countHistoryEntries,
    createVideo,
    createVideos,
    navigateTo,
    simulateScrollToEnd,
    simulateUnauthenticated,
} from "../utils";

describe("HistoryPage", () => {
    const HISTORY_PAGE_SIZE = 10;

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
        it("should render sections with dates and video grids", async () => {
            const firstSectionVideos = createVideos(3, {});
            createHistoryEntries(firstSectionVideos, new Date(2024, 0, 2));
            const secondSectionVideos = createVideos(3, {});
            createHistoryEntries(secondSectionVideos, new Date(2024, 0, 1));
            const { waitForDataToLoad, getSections, getSectionComponents } =
                navigateToPage();
            await waitForDataToLoad();

            const sections = getSections();
            expect(sections.length).toBe(2);
            let { date, items } = getSectionComponents(sections[0]);
            expect(date).toHaveTextContent("01/02/2024");
            expect(items.length).toBe(3);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(firstSectionVideos[index].title)
            );
            ({ date, items } = getSectionComponents(sections[1]));
            expect(date).toHaveTextContent("01/01/2024");
            expect(items.length).toBe(3);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(secondSectionVideos[index].title)
            );
        });

        it("should render avatars and usernames", async () => {
            const videos = createVideos(3, {});
            createHistoryEntries(videos);
            const {
                waitForDataToLoad,
                getSections,
                getSectionComponents,
                getItemComponents,
            } = navigateToPage();
            await waitForDataToLoad();

            const section = getSections()[0];
            const items = getSectionComponents(section).items;
            items.forEach((item) => {
                const { authorAvatar, authorUsername } =
                    getItemComponents(item);
                expect(authorAvatar).toBeInTheDocument();
                expect(authorUsername).toBeInTheDocument();
            });
        });

        it("should load more videos on scroll", async () => {
            const firstSectionVideos = createVideos(HISTORY_PAGE_SIZE * 2, {});
            createHistoryEntries(firstSectionVideos, new Date(2024, 0, 2));
            const secondSectionVideos = createVideos(HISTORY_PAGE_SIZE, {});
            createHistoryEntries(secondSectionVideos, new Date(2024, 0, 1));
            const {
                waitForDataToLoad,
                getSections,
                getSectionComponents,
                scrollVideos,
            } = navigateToPage();
            await waitForDataToLoad();
            let sections = getSections();
            expect(sections.length).toBe(1);
            let items = getSectionComponents(sections[0]).items;
            expect(items.length).toBe(HISTORY_PAGE_SIZE);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(firstSectionVideos[index].title)
            );

            await scrollVideos();
            await waitFor(() => {
                sections = getSections();
                expect(sections.length).toBe(1);
                items = getSectionComponents(sections[0]).items;
                expect(items.length).toBe(HISTORY_PAGE_SIZE * 2);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        firstSectionVideos[index].title
                    )
                );
            });

            await scrollVideos();
            await waitFor(() => {
                sections = getSections();
                expect(sections.length).toBe(2);
                items = getSectionComponents(sections[0]).items;
                expect(items.length).toBe(HISTORY_PAGE_SIZE * 2);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        firstSectionVideos[index].title
                    )
                );
                items = getSectionComponents(sections[1]).items;
                expect(items.length).toBe(HISTORY_PAGE_SIZE);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        secondSectionVideos[index].title
                    )
                );
            });
        });
    });

    describe("action menu", () => {
        it("should render action menu buttons", async () => {
            const videos = createVideos(3, {});
            createHistoryEntries(videos);
            const {
                waitForDataToLoad,
                getSections,
                getSectionComponents,
                getItemComponents,
            } = navigateToPage();
            await waitForDataToLoad();

            const section = getSections()[0];
            const items = getSectionComponents(section).items;
            items.forEach((item) => {
                expect(
                    getItemComponents(item).actionMenuButton
                ).toBeInTheDocument();
            });
        });

        it("should render the menu correctly", async () => {
            const videos = createVideos(1, {});
            createHistoryEntries(videos);
            const {
                waitForDataToLoad,
                getSections,
                getSectionComponents,
                openActionMenu,
                getActionMenu,
            } = navigateToPage();
            await waitForDataToLoad();
            const section = getSections()[0];
            const item = getSectionComponents(section).items[0];
            await openActionMenu(item);

            const { removeFromWatchHistoryItem } = getActionMenu();
            expect(removeFromWatchHistoryItem).toBeInTheDocument();
        });

        it("should delete history entries when the remove from watch history item is clicked", async () => {
            const video = createVideo({});
            createHistoryEntries([video], new Date(2024, 0, 2));
            createHistoryEntries([video], new Date(2024, 0, 1));
            const {
                waitForDataToLoad,
                getSections,
                getSectionComponents,
                openActionMenu,
                getActionMenu,
                user,
            } = navigateToPage();
            await waitForDataToLoad();
            const section = getSections()[0];
            const item = getSectionComponents(section).items[0];
            await openActionMenu(item);
            expect(countHistoryEntries(video.id)).toBe(2);

            await user.click(getActionMenu().removeFromWatchHistoryItem!);

            expect(countHistoryEntries(video.id)).toBe(0);
        });

        it("should remove video from video grids when the remove from watch history item is clicked", async () => {
            const video = createVideo({});
            const firstSectionVideos = [...createVideos(2, {}), video];
            createHistoryEntries(firstSectionVideos, new Date(2024, 0, 2));
            const secondSectionVideos = [video, ...createVideos(2, {})];
            createHistoryEntries(secondSectionVideos, new Date(2024, 0, 1));

            const {
                waitForDataToLoad,
                getSections,
                getSectionComponents,
                openActionMenu,
                getActionMenu,
                user,
            } = navigateToPage();
            await waitForDataToLoad();
            const section = getSections()[0];
            const item = getSectionComponents(section).items[2];
            await openActionMenu(item);

            await user.click(getActionMenu().removeFromWatchHistoryItem!);

            const sections = getSections();
            expect(sections.length).toBe(2);
            let items = getSectionComponents(sections[0]).items;
            expect(items.length).toBe(2);
            expect(items[0]).toHaveTextContent(firstSectionVideos[0].title);
            expect(items[1]).toHaveTextContent(firstSectionVideos[1].title);
            items = getSectionComponents(sections[1]).items;
            expect(items.length).toBe(2);
            expect(items[0]).toHaveTextContent(secondSectionVideos[1].title);
            expect(items[1]).toHaveTextContent(secondSectionVideos[2].title);
        });
    });
});

function navigateToPage() {
    const { getLocation } = navigateTo("/history");

    const getSpinner = () => screen.queryByRole("progressbar");

    const getSections = () => screen.queryAllByTestId("history-section");
    const getSectionComponents = (section: HTMLElement) => {
        return {
            date: within(section).queryByLabelText(/date/i),
            items: within(section).queryAllByTestId("video-grid-item"),
        };
    };

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
            removeFromWatchHistoryItem:
                menu &&
                within(menu).queryByRole("menuitem", {
                    name: /remove from watch history/i,
                }),
        };
    };

    const user = userEvent.setup();

    const waitForDataToLoad = () =>
        waitFor(
            () => {
                try {
                    expect(getSpinner()).not.toBeInTheDocument();
                } catch {
                    expect(getSections()[0]).toBeInTheDocument();
                }
            },
            { timeout: 5000 }
        );

    const scrollVideos = () => simulateScrollToEnd();

    const openActionMenu = (item: HTMLElement) =>
        user.click(getItemComponents(item).actionMenuButton!);

    return {
        getLocation,
        getSpinner,
        waitForDataToLoad,
        getSections,
        getSectionComponents,
        getItemComponents,
        getActionMenu,
        user,
        scrollVideos,
        openActionMenu,
    };
}

export function createHistoryEntries(
    videos: Video[],
    creationDate?: Date
): HistoryEntry[] {
    if (!creationDate) creationDate = new Date();
    return videos.map(
        (video) =>
            db.historyEntry.create({
                video,
                profile: getOwnProfile().id,
                creation_date: creationDate,
            }) as HistoryEntry
    );
}
