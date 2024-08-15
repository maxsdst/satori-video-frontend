import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import * as useLogoutModule from "../../src/auth/hooks/useLogout";
import TopNav from "../../src/components/TopNav";
import { getOwnProfile } from "../mocks/db";
import {
    renderWithRouter,
    simulateScreenSize,
    simulateUnauthenticated,
} from "../utils";

describe("TopNav", () => {
    describe("navigation button", () => {
        it("should render the navigation button", () => {
            const { getNavigationButton } = renderComponent();

            expect(getNavigationButton()).toBeInTheDocument();
        });

        it("should call toggleSidenav when the button is clicked", async () => {
            const { getNavigationButton, toggleSidenav, user } =
                renderComponent();
            expect(toggleSidenav).not.toBeCalled();

            await user.click(getNavigationButton()!);

            expect(toggleSidenav).toBeCalledTimes(1);
        });
    });

    describe("logo", () => {
        it("should render the logo", () => {
            const { getLogo } = renderComponent();

            expect(getLogo()).toBeInTheDocument();
        });

        it("should redirect to the home page when the logo is clicked", async () => {
            const { getLogo, user, getLocation } = renderComponent();
            const initialPathname = getLocation().pathname;
            expect(initialPathname).not.toBe("/");

            await user.click(getLogo()!);

            expect(getLocation().pathname).toBe("/");
        });
    });

    describe("search form", () => {
        it("should render the search form on screens md and above", async () => {
            await simulateScreenSize("md", () => {
                const { getSearchForm } = renderComponent();

                expect(getSearchForm()).toBeInTheDocument();
            });
        });

        it("should not render the search form on screens below md", async () => {
            await simulateScreenSize("sm", () => {
                const { getSearchForm } = renderComponent();

                expect(getSearchForm()).not.toBeInTheDocument();
            });
        });

        it("should render the search button on screens sm and below", async () => {
            await simulateScreenSize("sm", () => {
                const { getSearchButton } = renderComponent();

                expect(getSearchButton()).toBeInTheDocument();
            });
        });

        it("should not render the search button on screens above sm", async () => {
            await simulateScreenSize("md", () => {
                const { getSearchButton } = renderComponent();

                expect(getSearchButton()).not.toBeInTheDocument();
            });
        });

        it("should show search form and hide other elements when the search button is clicked", async () => {
            await simulateScreenSize("sm", async () => {
                const {
                    getSearchButton,
                    getSearchForm,
                    getBackButton,
                    getNavigationButton,
                    getLogo,
                    getUploadButton,
                    getNotificationsButton,
                    getAccountMenuButton,
                    user,
                } = renderComponent();
                expect(getSearchForm()).not.toBeInTheDocument();
                expect(getBackButton()).not.toBeInTheDocument();

                await user.click(getSearchButton()!);

                expect(getSearchForm()).toBeInTheDocument();
                expect(getBackButton()).toBeInTheDocument();
                expect(getNavigationButton()).not.toBeInTheDocument();
                expect(getLogo()).not.toBeInTheDocument();
                expect(getSearchButton()).not.toBeInTheDocument();
                expect(getUploadButton()).not.toBeInTheDocument();
                expect(getNotificationsButton()).not.toBeInTheDocument();
                expect(getAccountMenuButton()).not.toBeInTheDocument();
            });
        });

        it("should hide search form and show other elements when the back button is clicked", async () => {
            await simulateScreenSize("sm", async () => {
                const {
                    getSearchButton,
                    getSearchForm,
                    getBackButton,
                    getNavigationButton,
                    getLogo,
                    getUploadButton,
                    getNotificationsButton,
                    getAccountMenuButton,
                    user,
                } = renderComponent();
                await user.click(getSearchButton()!);
                expect(getSearchForm()).toBeInTheDocument();
                expect(getBackButton()).toBeInTheDocument();

                await user.click(getBackButton()!);

                expect(getSearchForm()).not.toBeInTheDocument();
                expect(getBackButton()).not.toBeInTheDocument();
                expect(getNavigationButton()).toBeInTheDocument();
                expect(getLogo()).toBeInTheDocument();
                expect(getSearchButton()).toBeInTheDocument();
                expect(getUploadButton()).toBeInTheDocument();
                expect(getNotificationsButton()).toBeInTheDocument();
                expect(getAccountMenuButton()).toBeInTheDocument();
            });
        });
    });

    describe("upload button", () => {
        it("should render the upload button", async () => {
            const { waitForDataToLoad, getUploadButton } = renderComponent();
            await waitForDataToLoad();

            expect(getUploadButton()).toBeInTheDocument();
        });

        it("should not render the upload button if user is not authenticated", async () => {
            simulateUnauthenticated();
            const { waitForDataToLoad, getUploadButton } = renderComponent();
            await waitForDataToLoad();

            expect(getUploadButton()).not.toBeInTheDocument();
        });

        it("should redirect to the uploads page and open upload modal when the button is clicked", async () => {
            const {
                waitForDataToLoad,
                getUploadButton,
                getUploadModal,
                getLocation,
                user,
            } = renderComponent(true);
            await waitForDataToLoad();
            expect(getLocation().pathname).not.toBe("/uploads");

            await user.click(getUploadButton()!);

            expect(getLocation().pathname).toBe("/uploads");
            expect(getUploadModal()).toBeInTheDocument();
        });
    });

    describe("notifications button", () => {
        it("should render the notifications button", async () => {
            const { waitForDataToLoad, getNotificationsButton } =
                renderComponent();
            await waitForDataToLoad();

            expect(getNotificationsButton()).toBeInTheDocument();
        });

        it("should not render the notifications button if user is not authenticated", async () => {
            simulateUnauthenticated();
            const { waitForDataToLoad, getNotificationsButton } =
                renderComponent();
            await waitForDataToLoad();

            expect(getNotificationsButton()).not.toBeInTheDocument();
        });

        it("should open notifications popover when the button is clicked", async () => {
            const {
                waitForDataToLoad,
                getNotificationsButton,
                getNotificationsPopover,
                user,
            } = renderComponent();
            await waitForDataToLoad();
            expect(getNotificationsPopover()).not.toBeInTheDocument();

            await user.click(getNotificationsButton()!);

            expect(getNotificationsPopover()).toBeInTheDocument();
        });
    });

    describe("account menu", () => {
        describe("account menu button", () => {
            it("should render the account menu button", async () => {
                const { waitForDataToLoad, getAccountMenuButton } =
                    renderComponent();
                await waitForDataToLoad();

                expect(getAccountMenuButton()).toBeInTheDocument();
            });

            it("should not render the account menu button if user is not authenticated", async () => {
                simulateUnauthenticated();
                const { waitForDataToLoad, getAccountMenuButton } =
                    renderComponent();
                await waitForDataToLoad();

                expect(getAccountMenuButton()).not.toBeInTheDocument();
            });

            it("should open the menu when the button is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getAccountMenuButton,
                    getAccountMenu,
                    user,
                } = renderComponent();
                await waitForDataToLoad();
                expect(getAccountMenu().menu).not.toBeInTheDocument();

                await user.click(getAccountMenuButton()!);

                expect(getAccountMenu().menu).toBeInTheDocument();
            });
        });

        describe("menu", () => {
            it("should render the menu correctly", async () => {
                const {
                    waitForDataToLoad,
                    getAccountMenuButton,
                    getAccountMenu,
                    user,
                } = renderComponent();
                await waitForDataToLoad();
                await user.click(getAccountMenuButton()!);

                const { menu, avatar, fullName, username } = getAccountMenu();
                expect(avatar).toBeInTheDocument();
                expect(avatar).toHaveAttribute("src", getOwnProfile().avatar);
                expect(fullName).toBeInTheDocument();
                expect(fullName).toHaveTextContent(getOwnProfile().full_name);
                expect(username).toBeInTheDocument();
                expect(username).toHaveTextContent(
                    `@${getOwnProfile().user.username}`
                );
                const items = within(menu!).queryAllByRole("menuitem");
                [/my profile/i, /log out/i].forEach((text, index) =>
                    expect(items[index]).toHaveTextContent(text)
                );
            });

            it("should redirect to own profile page when the my profile item is clicked", async () => {
                const ownProfilePagePathname = `/users/${
                    getOwnProfile().user.username
                }`;
                const {
                    waitForDataToLoad,
                    getAccountMenuButton,
                    getAccountMenu,
                    getLocation,
                    user,
                } = renderComponent();
                await waitForDataToLoad();
                await user.click(getAccountMenuButton()!);
                expect(getLocation().pathname).not.toBe(ownProfilePagePathname);

                await user.click(getAccountMenu().myProfileItem!);

                expect(getLocation().pathname).toBe(ownProfilePagePathname);
            });

            it("should log out and call window.location.reload when the log out item is clicked", async () => {
                const logout = vi.fn();
                vi.spyOn(useLogoutModule, "default").mockReturnValue(logout);
                const locationReload = vi.spyOn(window.location, "reload");
                const {
                    waitForDataToLoad,
                    getAccountMenuButton,
                    getAccountMenu,
                    user,
                } = renderComponent();
                await waitForDataToLoad();
                await user.click(getAccountMenuButton()!);
                expect(logout).not.toBeCalled();
                expect(locationReload).not.toBeCalled();

                await user.click(getAccountMenu().logOutItem!);

                expect(logout).toBeCalledTimes(1);
                expect(locationReload).toBeCalledTimes(1);
            });
        });

        describe("login button", () => {
            it("should render the login button if user is not authenticated", async () => {
                simulateUnauthenticated();
                const { waitForDataToLoad, getLoginButton } = renderComponent();
                await waitForDataToLoad();

                expect(getLoginButton()).toBeInTheDocument();
            });

            it("should not render the login button if user is authenticated", async () => {
                const { waitForDataToLoad, getLoginButton } = renderComponent();
                await waitForDataToLoad();

                expect(getLoginButton()).not.toBeInTheDocument();
            });

            it("should redirect to the login page when the button is clicked", async () => {
                simulateUnauthenticated();
                const { waitForDataToLoad, getLoginButton, getLocation, user } =
                    renderComponent();
                await waitForDataToLoad();
                expect(getLocation().pathname).not.toBe("/login");

                await user.click(getLoginButton()!);

                expect(getLocation().pathname).toBe("/login");
            });
        });
    });
});

function renderComponent(useAppRoutes?: boolean) {
    const toggleSidenav = vi.fn();

    const { getLocation } = renderWithRouter(
        <TopNav isSidenavOpen={false} toggleSidenav={toggleSidenav} />,
        useAppRoutes
    );

    const getNavigationButton = () =>
        screen.queryByRole("button", {
            name: /navigation/i,
        });
    const getLogo = () => screen.queryByRole("img", { name: /logo/i });

    const getSearchForm = () => screen.queryByRole("form", { name: /search/i });
    const getSearchButton = () => screen.queryByTestId("topnav-search-button");
    const getBackButton = () => screen.queryByRole("button", { name: /back/i });

    const getUploadButton = () =>
        screen.queryByRole("button", { name: /upload/i });
    const getUploadModal = () => screen.queryByTestId("upload-modal");

    const getNotificationsButton = () =>
        screen.queryByRole("button", { name: /notifications/i });
    const getNotificationsPopover = () =>
        screen.queryByRole("dialog", { name: /notifications/i });

    const getAccountMenuButton = () =>
        screen.queryByRole("button", { name: /account menu/i });
    const getAccountMenu = () => {
        const menu = screen.queryByRole("menu");
        return {
            menu,
            avatar:
                menu && within(menu).queryByRole("img", { name: /avatar/i }),
            fullName: menu && within(menu).queryByLabelText(/full name/i),
            username: menu && within(menu).queryByLabelText(/username/i),
            myProfileItem:
                menu &&
                within(menu).queryByRole("menuitem", { name: /my profile/i }),
            logOutItem:
                menu &&
                within(menu).queryByRole("menuitem", { name: /log out/i }),
        };
    };

    const getLoginButton = () =>
        screen.queryByRole("button", { name: /log in/i });

    const waitForDataToLoad = () =>
        waitFor(() =>
            expect(
                getAccountMenuButton() || getLoginButton()
            ).toBeInTheDocument()
        );

    const user = userEvent.setup();

    return {
        getLocation,
        getNavigationButton,
        getLogo,
        getSearchForm,
        getSearchButton,
        getBackButton,
        getUploadButton,
        getUploadModal,
        getNotificationsButton,
        getNotificationsPopover,
        getAccountMenuButton,
        getAccountMenu,
        getLoginButton,
        waitForDataToLoad,
        toggleSidenav,
        user,
    };
}
