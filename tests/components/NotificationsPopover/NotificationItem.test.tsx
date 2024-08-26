import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NotificationItem from "../../../src/components/NotificationsPopover/NotificationItem";
import NotificationsPopoverContext from "../../../src/components/NotificationsPopover/NotificationsPopoverContext";
import Comment from "../../../src/entities/Comment";
import Notification, {
    CommentNotification,
    ProfileNotification,
    VideoNotification,
} from "../../../src/entities/Notification";
import { db, NotificationSubtype, NotificationType } from "../../mocks/db";
import { createNotification, renderWithRouter } from "../../utils";

describe("NotificationItem", () => {
    let notification: Notification;

    beforeEach(() => {
        notification = createNotification({});
    });

    describe("date", () => {
        it("should render date correctly", () => {
            const notification = createNotification({
                creationDate: new Date(2024, 0, 24, 1, 1, 0),
            });
            vi.setSystemTime(new Date(2024, 0, 24, 1, 1, 24));
            const { date } = renderComponent({ notification });

            expect(date).toBeInTheDocument();
            expect(date).toHaveTextContent(/24 seconds ago/i);
        });
    });

    describe("action menu", () => {
        describe("menu button", () => {
            it("should render the menu button", () => {
                const { actionMenuButton } = renderComponent({ notification });

                expect(actionMenuButton).toBeInTheDocument();
            });

            it("should show the menu when the button is clicked", async () => {
                const { actionMenuButton, getActionMenu, user } =
                    renderComponent({ notification });
                expect(getActionMenu().menu).not.toBeInTheDocument();

                await user.click(actionMenuButton);

                expect(getActionMenu().menu).toBeInTheDocument();
            });
        });

        describe("menu", () => {
            it("should render the menu correctly", async () => {
                const { actionMenuButton, getActionMenu, user } =
                    renderComponent({ notification });
                await user.click(actionMenuButton);

                const { hideItem } = getActionMenu();
                expect(hideItem).toBeInTheDocument();
            });

            it("should delete notification when the hide item is clicked", async () => {
                const { actionMenuButton, getActionMenu, user } =
                    renderComponent({ notification });
                await user.click(actionMenuButton);
                expect(
                    db.notification.count({
                        where: { id: { equals: notification.id } },
                    })
                ).toBe(1);

                await user.click(getActionMenu().hideItem!);

                expect(
                    db.notification.count({
                        where: { id: { equals: notification.id } },
                    })
                ).toBe(0);
            });
        });
    });

    describe.each<{
        type: NotificationType;
        subtype: NotificationSubtype;
        getData: (notification: Notification) => {
            avatar?: string | null;
            username?: string;
            text?: string;
            thumbnail?: string;
            url?: string;
        };
    }>([
        {
            type: "profile",
            subtype: "new_follower",
            getData: (notification) => {
                const { related_profile } = notification as ProfileNotification;
                return {
                    avatar: related_profile.avatar,
                    username: related_profile.user.username,
                    url: `/users/${related_profile.user.username}`,
                };
            },
        },
        {
            type: "video",
            subtype: "upload_processed",
            getData: (notification) => {
                const { video } = notification as VideoNotification;
                return {
                    text: video.title,
                    thumbnail: video.thumbnail,
                    url: "/uploads",
                };
            },
        },
        {
            type: "video",
            subtype: "comment",
            getData: (notification) => {
                const { video, comment } = notification as VideoNotification;
                return {
                    avatar: comment.profile.avatar,
                    username: comment.profile.user.username,
                    text: comment.text,
                    thumbnail: video.thumbnail,
                    url: `/videos/${video.id}`,
                };
            },
        },
        {
            type: "video",
            subtype: "followed_profile_video",
            getData: (notification) => {
                const { video } = notification as VideoNotification;
                return {
                    avatar: video.profile.avatar,
                    username: video.profile.user.username,
                    text: video.title,
                    thumbnail: video.thumbnail,
                    url: `/videos/${video.id}`,
                };
            },
        },
        {
            type: "comment",
            subtype: "like",
            getData: (notification) => {
                const { video, comment } = notification as CommentNotification;
                return {
                    text: comment.text,
                    thumbnail: video.thumbnail,
                    url: `/videos/${video.id}`,
                };
            },
        },
        {
            type: "comment",
            subtype: "reply",
            getData: (notification) => {
                const { video, reply } = notification as CommentNotification;
                return {
                    avatar: reply.profile.avatar,
                    username: reply.profile.user.username,
                    text: reply.text,
                    thumbnail: video.thumbnail,
                    url: `/videos/${video.id}`,
                };
            },
        },
    ])("$type $subtype notification", ({ type, subtype, getData }) => {
        it("should render the item correctly", () => {
            const notification = createNotification({ type, subtype });
            const { item, avatar, username, thumbnail } = renderComponent({
                notification,
            });

            const data = getData(notification);
            if (data.avatar) {
                expect(avatar).toBeInTheDocument();
                expect(avatar).toHaveAttribute("src", data.avatar);
            }
            if (data.username) {
                expect(username).toBeInTheDocument();
                expect(username).toHaveTextContent(`@${data.username}`);
            }
            if (data.text) {
                expect(item).toHaveTextContent(data.text);
            }
            if (data.thumbnail) {
                expect(thumbnail).toBeInTheDocument();
                expect(thumbnail).toHaveAttribute("src", data.thumbnail);
            }
        });

        it("should redirect to the correct URL when the item is clicked", async () => {
            const notification = createNotification({ type, subtype });
            const { item, user, getLocation } = renderComponent({
                notification,
            });
            const { url } = getData(notification);
            expect(getLocation().pathname).not.toBe(url);

            await user.click(item);

            expect(getLocation().pathname).toBe(url);
        });

        it("should redirect to the profile page when the username is clicked", async () => {
            const notification = createNotification({ type, subtype });
            const data = getData(notification);
            if (!data.username) return;
            const url = `/users/${data.username}`;
            const { username, user, getLocation } = renderComponent({
                notification,
            });
            expect(getLocation().pathname).not.toBe(url);

            await user.click(username!);

            expect(getLocation().pathname).toBe(url);
        });
    });

    describe("clicking item", () => {
        it("should call closePopover when item is clicked", async () => {
            const { item, user, closePopover } = renderComponent({
                notification,
            });
            expect(closePopover).not.toBeCalled();

            await user.click(item);

            expect(closePopover).toBeCalledTimes(1);
        });

        it("should open the edit video modal when 'video' 'upload_processed' notification is clicked", async () => {
            const notification = createNotification({
                type: "video",
                subtype: "upload_processed",
            }) as VideoNotification;
            const { item, getEditVideoModal, user } = renderComponent(
                { notification },
                true
            );
            expect(getEditVideoModal()).not.toBeInTheDocument();

            await user.click(item);

            await waitFor(
                () => expect(getEditVideoModal()).toBeInTheDocument(),
                { timeout: 10000 }
            );
            const titleGroup = within(getEditVideoModal()!).getByRole("group", {
                name: /title/i,
            });
            const titleInput = within(titleGroup).getByRole("textbox");
            expect(titleInput).toHaveValue(notification.video.title);
        });

        it.each<{
            type: NotificationType;
            subtype: NotificationSubtype;
            getComment: (notification: Notification) => Comment;
        }>([
            {
                type: "video",
                subtype: "comment",
                getComment: (notification) =>
                    (notification as VideoNotification).comment,
            },
            {
                type: "comment",
                subtype: "like",
                getComment: (notification) =>
                    (notification as CommentNotification).comment,
            },
            {
                type: "comment",
                subtype: "reply",
                getComment: (notification) =>
                    (notification as CommentNotification).reply,
            },
        ])(
            "should show highlighted comment when $type $subtype notification is clicked",
            async ({ type, subtype, getComment }) => {
                const notification = createNotification({ type, subtype });
                const comment = getComment(notification);
                const {
                    item,
                    getHighlightedComment,
                    getHighlightedReply,
                    user,
                } = renderComponent({ notification }, true);

                await user.click(item);

                await waitFor(() => {
                    const highlightedComment = comment.parent
                        ? getHighlightedReply()
                        : getHighlightedComment();
                    expect(highlightedComment).toBeInTheDocument();
                    expect(highlightedComment).toHaveTextContent(comment.text);
                });
            }
        );
    });
});

interface Props {
    notification: Notification;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const closePopover = vi.fn();

    const { getLocation } = renderWithRouter(
        <NotificationsPopoverContext.Provider value={{ closePopover }}>
            <NotificationItem {...props} />
        </NotificationsPopoverContext.Provider>,
        useAppRoutes
    );

    const item = screen.getByRole("listitem");

    const avatar = screen.queryByRole("img", { name: /avatar/i });
    const username = screen.queryByRole("link", { name: /username/i });
    const date = screen.getByLabelText(/date/i);
    const thumbnail = screen.queryByRole("img", { name: /thumbnail/i });

    const actionMenuButton = screen.getByRole("button", {
        name: /action menu/i,
    });
    const getActionMenu = () => {
        const menu = screen.queryByRole("menu", { name: /actions/i });
        return {
            menu,
            hideItem:
                menu && within(menu).queryByRole("menuitem", { name: /hide/i }),
        };
    };

    const getEditVideoModal = () =>
        screen.queryByRole("dialog", { name: /edit video/i });

    const getComments = () => screen.queryByTestId("comments");
    const getHighlightedComment = () =>
        within(getComments()!).queryByLabelText(/highlighted comment/i);
    const getHighlightedReply = () =>
        within(getComments()!).queryByLabelText(/highlighted reply/i);

    const user = userEvent.setup();

    return {
        getLocation,
        item,
        avatar,
        username,
        date,
        thumbnail,
        actionMenuButton,
        getActionMenu,
        getEditVideoModal,
        getHighlightedComment,
        getHighlightedReply,
        user,
        closePopover,
    };
}
