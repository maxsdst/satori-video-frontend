import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import SearchInput from "../../src/components/SearchInput";
import { createProfiles, renderWithRouter } from "../utils";

describe("SearchInput", () => {
    describe("input", () => {
        it("should render the input", () => {
            const { input } = renderComponent();

            expect(input).toBeInTheDocument();
        });

        it("should show the results popover when typing in input", async () => {
            const { input, getResultsPopover, user } = renderComponent();
            expect(getResultsPopover().popover).not.toBeInTheDocument();

            await user.type(input, "abc");

            await waitFor(() =>
                expect(getResultsPopover().popover).toBeInTheDocument()
            );
        });
    });

    describe("submit button", () => {
        it("should render the submit button", () => {
            const { submitButton } = renderComponent();

            expect(submitButton).toBeInTheDocument();
        });

        it("should redirect to the search page when the button is clicked if the input is not empty", async () => {
            const { input, submitButton, getLocation, user } =
                renderComponent();
            const query = "abc 123";
            await user.type(input, query);
            expect(getLocation().pathname).not.toBe("/search/");

            await user.click(submitButton);

            const { pathname, search } = getLocation();
            expect(pathname).toBe("/search/");
            expect(new URLSearchParams(search).get("query")).toBe(query);
        });

        it("should not redirect to the search page when the button is clicked if the input is empty", async () => {
            const { submitButton, getLocation, user } = renderComponent();
            expect(getLocation().pathname).not.toBe("/search/");

            await user.click(submitButton);

            expect(getLocation().pathname).not.toBe("/search/");
        });
    });

    describe("results popover", () => {
        describe("user list", () => {
            it("should render the user list if there are profiles matching query", async () => {
                const query = "John Doe";
                createProfiles(3, { fullName: query });
                const { getResultsPopover, triggerResultsPopover } =
                    renderComponent();
                await triggerResultsPopover(query);

                expect(getResultsPopover().userList).toBeInTheDocument();
            });

            it("should not render the user list if there are no profiles matching query", async () => {
                const query = "John Doe";
                createProfiles(3, { fullName: "Tommy Atkins" });
                const { getResultsPopover, triggerResultsPopover } =
                    renderComponent();
                await triggerResultsPopover(query);

                expect(getResultsPopover().userList).not.toBeInTheDocument();
            });

            it("should render user items correctly", async () => {
                const query = "John Doe";
                const profiles = createProfiles(3, { fullName: query });
                const {
                    getResultsPopover,
                    getUserItemComponents,
                    triggerResultsPopover,
                } = renderComponent();
                await triggerResultsPopover(query);

                const { userItems } = getResultsPopover();
                profiles.forEach((profile, index) => {
                    const { avatar, username, fullName } =
                        getUserItemComponents(userItems[index]);
                    expect(avatar).toBeInTheDocument();
                    expect(avatar).toHaveAttribute("src", profile.avatar);
                    expect(username).toBeInTheDocument();
                    expect(username).toHaveTextContent(profile.user.username);
                    expect(fullName).toBeInTheDocument();
                    expect(fullName).toHaveTextContent(profile.full_name);
                });
            });

            it("should show no more than 5 users in the list", async () => {
                const query = "John Doe";
                createProfiles(7, { fullName: query });
                const { getResultsPopover, triggerResultsPopover } =
                    renderComponent();
                await triggerResultsPopover(query);

                const { userItems } = getResultsPopover();
                expect(userItems.length).toBe(5);
            });
        });

        describe("view all results item", () => {
            it("should render the view all results item", async () => {
                const { getResultsPopover, triggerResultsPopover } =
                    renderComponent();
                const query = "abc 123";
                await triggerResultsPopover(query);

                const { viewAllResultsItem } = getResultsPopover();
                expect(viewAllResultsItem).toBeInTheDocument();
                expect(viewAllResultsItem).toHaveTextContent(query);
            });

            it("should redirect to the search page when the item is clicked", async () => {
                const {
                    getResultsPopover,
                    triggerResultsPopover,
                    getLocation,
                    user,
                } = renderComponent();
                const query = "abc 123";
                await triggerResultsPopover(query);
                expect(getLocation().pathname).not.toBe("/search/");

                await user.click(getResultsPopover().viewAllResultsItem!);

                const { pathname, search } = getLocation();
                expect(pathname).toBe("/search/");
                expect(new URLSearchParams(search).get("query")).toBe(query);
            });
        });
    });
});

function renderComponent(useAppRoutes?: boolean) {
    const { getLocation } = renderWithRouter(<SearchInput />, useAppRoutes);

    const input = screen.getByPlaceholderText(/search/i);
    const submitButton = screen.getByRole("button", { name: /search/i });

    const getResultsPopover = () => {
        const popover = screen.queryByRole("dialog", {
            name: /search results/i,
        });
        const userList =
            popover && within(popover).queryByRole("list", { name: /users/i });
        return {
            popover,
            userList,
            userItems: userList
                ? within(userList).queryAllByRole("listitem")
                : [],
            viewAllResultsItem:
                popover &&
                within(popover).queryByRole("button", { name: /view all/i }),
        };
    };

    const getUserItemComponents = (item: HTMLElement) => {
        return {
            avatar: within(item).queryByRole("img", { name: /avatar/i }),
            username: within(item).queryByLabelText(/username/i),
            fullName: within(item).queryByLabelText(/full name/i),
        };
    };

    const user = userEvent.setup();

    const triggerResultsPopover = async (query: string) => {
        await user.type(input, query);
        await waitFor(() =>
            expect(getResultsPopover().popover).toBeInTheDocument()
        );
    };

    return {
        getLocation,
        input,
        submitButton,
        getResultsPopover,
        getUserItemComponents,
        triggerResultsPopover,
        user,
    };
}
