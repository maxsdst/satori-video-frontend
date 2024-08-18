import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NotificationsPopover from "../../../src/components/NotificationsPopover";
import { ProfileNotification } from "../../../src/entities/Notification";
import { db } from "../../mocks/db";
import {
    createNotifications,
    renderWithRouter,
    simulateScrollToEnd,
} from "../../utils";

describe("NotificationsPopover", () => {
    const NOTIFICATIONS_PAGE_SIZE = 10;

    describe("trigger", () => {
        describe("trigger button", () => {
            it("should render the trigger", () => {
                const { trigger } = renderComponent();

                expect(trigger).toBeInTheDocument();
            });

            it("should show popover when the trigger is clicked", async () => {
                const { trigger, getPopover, user } = renderComponent();

                await user.click(trigger);

                expect(getPopover().popover).toBeInTheDocument();
            });
        });

        describe("unseen notifications count", () => {
            it("should render unseen notifications count", async () => {
                createNotifications(12, { isSeen: false });
                const { trigger } = renderComponent();

                await waitFor(() => expect(trigger).toHaveTextContent("12"));
            });

            it("should render '99+' when unseen notifications count is greater than 99", async () => {
                createNotifications(100, { isSeen: false });
                const { trigger } = renderComponent();

                await waitFor(() => expect(trigger).toHaveTextContent("99+"));
            });

            it("should update unseen notifications count as notifications are fetched", async () => {
                createNotifications(NOTIFICATIONS_PAGE_SIZE * 3, {});
                const { trigger, openPopover, scrollNotifications } =
                    renderComponent();
                await waitFor(() =>
                    expect(trigger).toHaveTextContent(
                        (NOTIFICATIONS_PAGE_SIZE * 3).toString()
                    )
                );

                await openPopover();
                await waitFor(
                    () =>
                        expect(trigger).toHaveTextContent(
                            (NOTIFICATIONS_PAGE_SIZE * 2).toString()
                        ),
                    { timeout: 3000 }
                );

                await scrollNotifications();
                await waitFor(
                    () =>
                        expect(trigger).toHaveTextContent(
                            NOTIFICATIONS_PAGE_SIZE.toString()
                        ),
                    { timeout: 3000 }
                );
            });
        });
    });

    describe("popover", () => {
        describe("close button", () => {
            it("should render the close button", async () => {
                const { openPopover, getPopover } = renderComponent();
                await openPopover();

                expect(getPopover().closeButton).toBeInTheDocument();
            });

            it("should close the popover when the button is clicked", async () => {
                const { openPopover, getPopover, user } = renderComponent();
                await openPopover();
                const { popover, closeButton } = getPopover();
                expect(popover).toBeInTheDocument();

                await user.click(closeButton!);

                await waitFor(() =>
                    expect(getPopover().popover).not.toBeInTheDocument()
                );
            });
        });

        describe("notification list", () => {
            it("should render notifications", async () => {
                const notifications = createNotifications(3, {
                    type: "profile",
                    subtype: "new_follower",
                }) as ProfileNotification[];
                const { openPopover, getPopover } = renderComponent();
                await openPopover();

                const { items } = getPopover();
                notifications.forEach((notification, index) =>
                    expect(items[index]).toHaveTextContent(
                        notification.related_profile.user.username
                    )
                );
            });

            it("should render the spinner when there are more notifications", async () => {
                createNotifications(NOTIFICATIONS_PAGE_SIZE + 1, {});
                const { openPopover, getPopover } = renderComponent();
                await openPopover();

                expect(getPopover().spinner).toBeInTheDocument();
            });

            it("should not render the spinner when there are no more notifications", async () => {
                createNotifications(NOTIFICATIONS_PAGE_SIZE, {});
                const { openPopover, getPopover } = renderComponent();
                await openPopover();

                expect(getPopover().spinner).not.toBeInTheDocument();
            });

            it("should load more notifications on scroll and hide spinner when no more notifications are available", async () => {
                const notifications = createNotifications(
                    NOTIFICATIONS_PAGE_SIZE * 3,
                    { type: "profile", subtype: "new_follower" }
                ) as ProfileNotification[];
                const { openPopover, getPopover, scrollNotifications } =
                    renderComponent();
                await openPopover();
                let { items, spinner } = getPopover();
                expect(items.length).toBe(NOTIFICATIONS_PAGE_SIZE);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        notifications[index].related_profile.user.username
                    )
                );
                expect(spinner).toBeInTheDocument();

                await scrollNotifications();
                await waitFor(() => {
                    ({ items, spinner } = getPopover());
                    expect(items.length).toBe(NOTIFICATIONS_PAGE_SIZE * 2);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(
                            notifications[index].related_profile.user.username
                        )
                    );
                    expect(spinner).toBeInTheDocument();
                });

                await scrollNotifications();
                await waitFor(() => {
                    ({ items, spinner } = getPopover());
                    expect(items.length).toBe(NOTIFICATIONS_PAGE_SIZE * 3);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(
                            notifications[index].related_profile.user.username
                        )
                    );
                    expect(spinner).not.toBeInTheDocument();
                });
            });

            it("should mark fetched notifications as seen", async () => {
                const notifications = createNotifications(
                    NOTIFICATIONS_PAGE_SIZE * 2,
                    {}
                );
                const { openPopover, scrollNotifications } = renderComponent();
                expect(countSeenNotifications()).toBe(0);

                await openPopover();
                expect(countSeenNotifications()).toBe(NOTIFICATIONS_PAGE_SIZE);
                notifications
                    .slice(0, NOTIFICATIONS_PAGE_SIZE)
                    .forEach((notification) =>
                        expect(isNotificationSeen(notification.id)).toBe(true)
                    );

                await scrollNotifications();
                expect(countSeenNotifications()).toBe(
                    NOTIFICATIONS_PAGE_SIZE * 2
                );
                notifications.forEach((notification) =>
                    expect(isNotificationSeen(notification.id)).toBe(true)
                );
            });
        });
    });
});

function renderComponent(useAppRoutes?: boolean) {
    const { getLocation } = renderWithRouter(
        <NotificationsPopover />,
        useAppRoutes
    );

    const trigger = screen.getByRole("button", { name: /notifications/i });

    const getPopover = () => {
        const popover = screen.queryByRole("dialog", {
            name: /notifications/i,
        });
        return {
            popover,
            closeButton:
                popover &&
                within(popover).queryByRole("button", { name: /close/i }),
            notificationListContainer:
                popover &&
                within(popover).queryByTestId("notification-list-container"),
            items: popover ? within(popover).queryAllByRole("listitem") : [],
            spinner: popover && within(popover).queryByRole("progressbar"),
        };
    };

    const user = userEvent.setup();

    const openPopover = () => user.click(trigger);

    const scrollNotifications = () =>
        simulateScrollToEnd(getPopover().notificationListContainer!);

    return {
        getLocation,
        trigger,
        getPopover,
        openPopover,
        scrollNotifications,
        user,
    };
}

function countSeenNotifications() {
    return db.notification.count({ where: { is_seen: { equals: true } } });
}

function isNotificationSeen(notificationId: number): boolean {
    return (
        db.notification.findFirst({
            where: { id: { equals: notificationId } },
        })?.is_seen === true
    );
}
