import { MenuItem, MenuList } from "@chakra-ui/react";
import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import Item from "../../../src/components/VideoGrid/Item";
import Video from "../../../src/entities/Video";
import { LocationState } from "../../../src/pages/VideoPage";
import { createVideo, renderWithRouter } from "../../utils";

describe("Item", () => {
    let video: Video;

    beforeEach(() => {
        video = createVideo({});
    });

    describe("thumbnail", () => {
        it("should render the thumbnail", () => {
            const { thumbnail } = renderComponent({ video });

            expect(thumbnail).toBeInTheDocument();
        });

        it("should redirect to the video page when thumbnail is clicked", async () => {
            const { thumbnail, user, getLocation } = renderComponent({ video });

            await user.click(thumbnail!);

            expect(getLocation().pathname).toBe(`/videos/${video.id}`);
        });
    });

    describe("view count", () => {
        it("should render the view count", () => {
            const { viewCount } = renderComponent({ video });

            expect(viewCount).toBeInTheDocument();
            expect(viewCount).toHaveTextContent(video.view_count.toString());
        });
    });

    describe("title", () => {
        it("should render the title", () => {
            const { title } = renderComponent({ video });

            expect(title).toBeInTheDocument();
        });

        it("should redirect to the video page when title is clicked", async () => {
            const { title, user, getLocation } = renderComponent({ video });

            await user.click(title!);

            expect(getLocation().pathname).toBe(`/videos/${video.id}`);
        });
    });

    describe("author's avatar and username", () => {
        it("should render avatar and username if showUser is set to true", () => {
            const { getAuthorAvatar, getAuthorUsername } = renderComponent({
                video,
                showUser: true,
            });

            const avatar = getAuthorAvatar();
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute("src", video.profile.avatar);
            const username = getAuthorUsername();
            expect(username).toBeInTheDocument();
            expect(username).toHaveTextContent(video.profile.user.username);
        });

        it("should not render avatar and username if showUser is set to false", () => {
            const { getAuthorAvatar, getAuthorUsername } = renderComponent({
                video,
                showUser: false,
            });

            expect(getAuthorAvatar()).not.toBeInTheDocument();
            expect(getAuthorUsername()).not.toBeInTheDocument();
        });

        it("should redirect to the profile page when avatar is clicked", async () => {
            const { getAuthorAvatar, user, getLocation } = renderComponent({
                video,
            });

            await user.click(getAuthorAvatar()!);

            expect(getLocation().pathname).toBe(
                `/users/${video.profile.user.username}`
            );
        });

        it("should redirect to the profile page when username is clicked", async () => {
            const { getAuthorUsername, user, getLocation } = renderComponent({
                video,
            });

            await user.click(getAuthorUsername()!);

            expect(getLocation().pathname).toBe(
                `/users/${video.profile.user.username}`
            );
        });
    });

    describe("like count", () => {
        it("should render the like count if showLikes is set to true", () => {
            const { getLikeCount } = renderComponent({
                video,
                showLikes: true,
            });

            const likeCount = getLikeCount();
            expect(likeCount).toBeInTheDocument();
            expect(likeCount).toHaveTextContent(video.like_count.toString());
        });

        it("should not render the like count if showLikes is set to false", () => {
            const { getLikeCount } = renderComponent({
                video,
                showLikes: false,
            });

            expect(getLikeCount()).not.toBeInTheDocument();
        });
    });

    describe("action menu", () => {
        it("should render the action menu button if actionMenuList is set", () => {
            const { getActionMenuButton } = renderComponent({
                video,
                actionMenuList: () => null,
            });

            expect(getActionMenuButton()).toBeInTheDocument();
        });

        it("should not render the action menu button if actionMenuList is not set", () => {
            const { getActionMenuButton } = renderComponent({
                video,
                actionMenuList: undefined,
            });

            expect(getActionMenuButton()).not.toBeInTheDocument();
        });

        it("should show action menu when the action menu button is clicked", async () => {
            const { getActionMenuButton, user } = renderComponent({
                video,
                actionMenuList: () => (
                    <MenuList>
                        <MenuItem>Abc 1</MenuItem>
                        <MenuItem>Abc 2</MenuItem>
                    </MenuList>
                ),
            });

            await user.click(getActionMenuButton()!);

            const menu = screen.getByRole("menu");
            expect(menu).toBeInTheDocument();
            ["Abc 1", "Abc 2"].forEach((text) =>
                expect(
                    within(menu).getByRole("menuitem", { name: text })
                ).toBeInTheDocument()
            );
        });
    });
});

interface Props {
    video: Video;
    showUser?: boolean;
    showLikes?: boolean;
    videoLinkState?: LocationState;
    actionMenuList?: (props: { video: Video }) => ReactNode;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        showUser: true,
        showLikes: true,
        videoLinkState: { initialVideoIndex: 0 },
    };

    const { getLocation } = renderWithRouter(
        <Item {...{ ...defaults, ...props }} />,
        useAppRoutes
    );

    const thumbnail = screen.queryByRole("img", { name: /thumbnail/i });
    const viewCount = screen.queryByLabelText(/views/i);
    const title = screen.queryByLabelText(/title/i);

    const getAuthorAvatar = () =>
        screen.queryByRole("img", { name: /avatar/i });
    const getAuthorUsername = () => screen.queryByLabelText(/username/i);

    const getLikeCount = () => screen.queryByLabelText(/likes/i);

    const getActionMenuButton = () =>
        screen.queryByRole("button", { name: /action menu/i });

    const user = userEvent.setup();

    return {
        getLocation,
        thumbnail,
        viewCount,
        title,
        getAuthorAvatar,
        getAuthorUsername,
        getLikeCount,
        getActionMenuButton,
        user,
    };
}
