import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import ProfileListModal from "../../src/components/ProfileListModal";
import Profile from "../../src/entities/Profile";
import {
    createProfile,
    createProfiles,
    renderWithRouter,
    simulateScrollToEnd,
} from "../utils";

describe("ProfileListModal", () => {
    describe("initial state", () => {
        it("should not render modal when isOpen prop is set to false", () => {
            const { getModal } = renderComponent({
                profiles: [],
                isOpen: false,
            });

            expect(getModal()).not.toBeInTheDocument();
        });

        it("should render modal when isOpen prop is set to true", () => {
            const { getModal } = renderComponent({
                profiles: [],
                isOpen: true,
            });

            expect(getModal()).toBeInTheDocument();
        });
    });

    describe("header", () => {
        it("should render the header", () => {
            const text = "test 123";
            const { getHeader } = renderComponent({
                profiles: [],
                header: text,
            });

            const header = getHeader();
            expect(header).toBeInTheDocument();
            expect(header).toHaveTextContent(text);
        });
    });

    describe("close button", () => {
        it("should render the close button", () => {
            const { getCloseButton } = renderComponent({ profiles: [] });

            expect(getCloseButton()).toBeInTheDocument();
        });

        it("should call onClose when the button is clicked", async () => {
            const { getCloseButton, onClose, user } = renderComponent({
                profiles: [],
            });
            expect(onClose).not.toBeCalled();

            await user.click(getCloseButton()!);

            expect(onClose).toBeCalled();
        });
    });

    describe("user list", () => {
        it("should render avatars", () => {
            const profiles = createProfiles(3, {});
            const { getItems, getItemComponents } = renderComponent({
                profiles,
            });

            const items = getItems();
            items.forEach((item, index) => {
                const { avatar } = getItemComponents(item);
                expect(avatar).toBeInTheDocument();
                expect(avatar).toHaveAttribute("src", profiles[index].avatar);
            });
        });

        it("should render usernames", () => {
            const profiles = createProfiles(3, {});
            const { getItems, getItemComponents } = renderComponent({
                profiles,
            });

            const items = getItems();
            items.forEach((item, index) => {
                const { username } = getItemComponents(item);
                expect(username).toBeInTheDocument();
                expect(username).toHaveTextContent(
                    profiles[index].user.username
                );
            });
        });

        it("should render full names", () => {
            const profiles = createProfiles(3, {});
            const { getItems, getItemComponents } = renderComponent({
                profiles,
            });

            const items = getItems();
            items.forEach((item, index) => {
                const { fullName } = getItemComponents(item);
                expect(fullName).toBeInTheDocument();
                expect(fullName).toHaveTextContent(profiles[index].full_name);
            });
        });

        it("should redirect to the profile page when an item is clicked", async () => {
            const profile = createProfile({});
            const pathname = `/users/${profile.user.username}`;
            const { getItems, getLocation, user } = renderComponent({
                profiles: [profile],
            });
            expect(getLocation().pathname).not.toBe(pathname);

            await user.click(getItems()[0]);

            expect(getLocation().pathname).toBe(pathname);
        });

        it("should call onFetchMore when the list is scrolled if hasMore is set to true", async () => {
            const { onFetchMore, scrollList } = renderComponent({
                profiles: [],
                hasMore: true,
            });
            expect(onFetchMore).not.toBeCalled();

            await scrollList();

            expect(onFetchMore).toBeCalledTimes(1);
        });

        it("should not call onFetchMore when the list is scrolled if hasMore is set to false", async () => {
            const { onFetchMore, scrollList } = renderComponent({
                profiles: [],
                hasMore: false,
            });
            expect(onFetchMore).not.toBeCalled();

            await scrollList();

            expect(onFetchMore).not.toBeCalled();
        });
    });
});

interface Props {
    profiles: Profile[];
    hasMore?: boolean;
    header?: string;
    isOpen?: boolean;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        hasMore: false,
        header: "",
        isOpen: true,
    };

    const onFetchMore = vi.fn();
    const onClose = vi.fn();

    const { getLocation } = renderWithRouter(
        <ProfileListModal
            {...{ ...defaults, ...props }}
            onFetchMore={onFetchMore}
            onClose={onClose}
        />,
        useAppRoutes
    );

    const getModal = () => screen.queryByRole("dialog");
    const getHeader = () => within(getModal()!).queryByRole("banner");
    const getCloseButton = () =>
        within(getModal()!).queryByRole("button", { name: /close/i });

    const getUserListContainer = () =>
        screen.queryByTestId("user-list-container");

    const getItems = () => {
        const list = within(getModal()!).getByRole("list", { name: /users/i });
        return within(list).getAllByRole("listitem");
    };
    const getItemComponents = (item: HTMLElement) => {
        return {
            avatar: within(item).queryByLabelText(/avatar/i),
            username: within(item).queryByLabelText(/username/i),
            fullName: within(item).queryByLabelText(/full name/i),
        };
    };

    const user = userEvent.setup();

    const scrollList = () => simulateScrollToEnd(getUserListContainer()!);

    return {
        getLocation,
        getModal,
        getHeader,
        getCloseButton,
        getItems,
        getItemComponents,
        user,
        scrollList,
        onFetchMore,
        onClose,
    };
}
