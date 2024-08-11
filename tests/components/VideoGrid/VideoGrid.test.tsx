import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import VideoGrid from "../../../src/components/VideoGrid";
import { VideoLinkState } from "../../../src/components/VideoGrid/VideoGrid";
import Video from "../../../src/entities/Video";
import { VideoSource } from "../../../src/pages/VideoPage";
import { setRecommendedVideos } from "../../mocks/db";
import { createVideos, renderWithRouter } from "../../utils";

const PLAYER_HEIGHT = 100;

describe("VideoGrid", () => {
    let videos: Video[];

    beforeEach(() => {
        videos = createVideos(3, {});
    });

    describe("items", () => {
        it("should render items", () => {
            const { items } = renderComponent({ videos });

            expect(items.length).toBe(videos.length);
            items.forEach((item, index) =>
                expect(item).toHaveTextContent(videos[index].title)
            );
        });
    });

    describe("avatars and usernames", () => {
        it("should render avatars and usernames if showUsers is set to true", () => {
            const { items, getItemComponents } = renderComponent({
                videos,
                showUsers: true,
            });

            items.forEach((item) => {
                const { authorAvatar, authorUsername } =
                    getItemComponents(item);
                expect(authorAvatar).toBeInTheDocument();
                expect(authorUsername).toBeInTheDocument();
            });
        });

        it("should not render avatars and usernames if showUsers is set to false", () => {
            const { items, getItemComponents } = renderComponent({
                videos,
                showUsers: false,
            });

            items.forEach((item) => {
                const { authorAvatar, authorUsername } =
                    getItemComponents(item);
                expect(authorAvatar).not.toBeInTheDocument();
                expect(authorUsername).not.toBeInTheDocument();
            });
        });
    });

    describe("like counts", () => {
        it("should render like counts if showLikes is set to true", () => {
            const { items, getItemComponents } = renderComponent({
                videos,
                showLikes: true,
            });

            items.forEach((item) =>
                expect(getItemComponents(item).likeCount).toBeInTheDocument()
            );
        });

        it("should not render like counts if showLikes is set to false", () => {
            const { items, getItemComponents } = renderComponent({
                videos,
                showLikes: false,
            });

            items.forEach((item) =>
                expect(
                    getItemComponents(item).likeCount
                ).not.toBeInTheDocument()
            );
        });
    });

    describe("action menu buttons", () => {
        it("should render action menu buttons if actionMenuList is set", () => {
            const { items, getItemComponents } = renderComponent({
                videos,
                actionMenuList: () => null,
            });

            items.forEach((item) =>
                expect(
                    getItemComponents(item).actionMenuButton
                ).toBeInTheDocument()
            );
        });

        it("should not render action menu buttons if actionMenuList is not set", () => {
            const { items, getItemComponents } = renderComponent({
                videos,
                actionMenuList: undefined,
            });

            items.forEach((item) =>
                expect(
                    getItemComponents(item).actionMenuButton
                ).not.toBeInTheDocument()
            );
        });
    });

    describe("clicking item", () => {
        it("should redirect to video page and start with slide at clicked item's index if videoSource is provided", async () => {
            setRecommendedVideos(videos);
            const {
                items,
                getItemComponents,
                user,
                getLocation,
                validateVideoPageIndex,
            } = renderComponent(
                {
                    videos,
                    showLikes: false,
                    videoLinkState: { videoSource: VideoSource.Recommended },
                },
                true
            );
            const index = 2;

            await user.click(getItemComponents(items[index]).thumbnail!);

            expect(getLocation().pathname).toBe(`/videos/${videos[index].id}`);
            validateVideoPageIndex(index);
        });

        it("should redirect to video page and start with first slide when videoSource is not provided", async () => {
            const {
                items,
                getItemComponents,
                user,
                getLocation,
                validateVideoPageIndex,
            } = renderComponent(
                {
                    videos,
                    showLikes: false,
                    videoLinkState: { videoSource: undefined },
                },
                true
            );
            const index = 2;

            await user.click(getItemComponents(items[index]).thumbnail!);

            expect(getLocation().pathname).toBe(`/videos/${videos[index].id}`);
            validateVideoPageIndex(0);
        });
    });
});

interface Props {
    videos: Video[];
    showUsers?: boolean;
    showLikes?: boolean;
    videoLinkState?: VideoLinkState;
    actionMenuList?: (props: { video: Video }) => ReactNode;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        showUsers: false,
        showLikes: false,
    };

    mockPlayersOffsetTop();

    const { getLocation } = renderWithRouter(
        <VideoGrid {...{ ...defaults, ...props }} />,
        useAppRoutes
    );

    const items = screen.queryAllByTestId("video-grid-item");

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

    const user = userEvent.setup();

    const validateVideoPageIndex = (currentIndex: number) => {
        const slidesContainer = screen.queryByTestId("slides-container");
        expect(slidesContainer).toHaveStyle(
            `transform: translate(0px,${0 - currentIndex * PLAYER_HEIGHT}px);`
        );
    };

    return {
        getLocation,
        items,
        getItemComponents,
        validateVideoPageIndex,
        user,
    };
}

function mockPlayersOffsetTop() {
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(
        function (this: HTMLElement) {
            if (this.dataset.testid === "player") {
                const siblings = Array.from(this.parentElement!.children);
                const index = siblings.indexOf(this);
                return index * PLAYER_HEIGHT;
            }

            return 0;
        }
    );
}
