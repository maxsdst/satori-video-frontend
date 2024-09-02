import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { CORRECT_PASSWORD, getOwnProfile } from "../mocks/db";
import { didLogIn } from "../mocks/handlers/auth";
import { BASE_URL } from "../mocks/handlers/constants";
import { navigateTo, simulateError, simulateUnauthenticated } from "../utils";

describe("LoginPage", () => {
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

    describe("authenticated", () => {
        it("should redirect to '/' if user is authenticated", async () => {
            const { waitForDataToLoad, getLocation } = navigateToPage(
                undefined,
                true
            );
            expect(getLocation().pathname).not.toBe("/");

            await waitForDataToLoad();

            expect(getLocation().pathname).toBe("/");
        });
    });

    describe("login form", () => {
        it("should render the login form", async () => {
            const { waitForDataToLoad, getForm } = navigateToPage();
            await waitForDataToLoad();

            expect(getForm()).toBeInTheDocument();
        });

        describe("username input", () => {
            it("should render the input", async () => {
                const { waitForDataToLoad, getUsernameInput } =
                    navigateToPage();
                await waitForDataToLoad();

                expect(getUsernameInput().input).toBeInTheDocument();
            });

            it("should show error message on submit if value is empty", async () => {
                const { waitForDataToLoad, getUsernameInput, submitForm } =
                    navigateToPage();
                await waitForDataToLoad();
                expect(getUsernameInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getUsernameInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/required/i);
            });
        });

        describe("password input", () => {
            it("should render the input", async () => {
                const { waitForDataToLoad, getPasswordInput } =
                    navigateToPage();
                await waitForDataToLoad();

                expect(getPasswordInput().input).toBeInTheDocument();
            });

            it("should show error message on submit if value is empty", async () => {
                const { waitForDataToLoad, getPasswordInput, submitForm } =
                    navigateToPage();
                await waitForDataToLoad();
                expect(getPasswordInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getPasswordInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/required/i);
            });
        });

        describe("log in button", () => {
            it("should render the log in button", async () => {
                const { waitForDataToLoad, getLogInButton } = navigateToPage();
                await waitForDataToLoad();

                expect(getLogInButton()).toBeInTheDocument();
            });
        });

        describe("login", () => {
            it("should log in on submit", async () => {
                const { waitForDataToLoad, fillForm, submitForm } =
                    navigateToPage();
                await waitForDataToLoad();
                await fillForm();
                expect(didLogIn()).toBe(false);

                await submitForm();

                expect(didLogIn()).toBe(true);
            });

            it("should redirect to the home page if login succeeded", async () => {
                const { waitForDataToLoad, fillForm, submitForm, getLocation } =
                    navigateToPage();
                await waitForDataToLoad();
                expect(getLocation().pathname).not.toBe("/");

                await fillForm();
                await submitForm();

                expect(getLocation().pathname).toBe("/");
            });

            it("should redirect to specified path after login if 'next' is set in location state", async () => {
                const pathname = "/saved";
                const { waitForDataToLoad, fillForm, submitForm, getLocation } =
                    navigateToPage({ next: pathname });
                await waitForDataToLoad();
                expect(getLocation().pathname).not.toBe(pathname);

                await fillForm();
                await submitForm();

                await waitFor(() => {
                    expect(getLocation().pathname).toBe(pathname);
                });
            });

            it("should show error message if login failed", async () => {
                const errorText = "error 123";
                simulateError(BASE_URL + "/auth/jwt/create/", "post", {
                    body: { detail: [errorText] },
                });
                const { waitForDataToLoad, fillForm, submitForm, getError } =
                    navigateToPage();
                await waitForDataToLoad();

                await fillForm();
                await submitForm();

                const error = getError();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(errorText);
            });
        });
    });

    describe("sign up button", () => {
        it("should render the sign up button", async () => {
            const { waitForDataToLoad, getSignUpButton } = navigateToPage();
            await waitForDataToLoad();

            expect(getSignUpButton()).toBeInTheDocument();
        });

        it("should redirect to the signup page when the sign up button is clicked", async () => {
            const { waitForDataToLoad, getLocation, getSignUpButton, user } =
                navigateToPage();
            await waitForDataToLoad();
            expect(getLocation().pathname).not.toBe("/signup");

            await user.click(getSignUpButton());

            expect(getLocation().pathname).toBe("/signup");
        });
    });
});

interface LocationState {
    next?: string;
}

function navigateToPage(
    state?: LocationState,
    isAuthenticated: boolean = false
) {
    if (!isAuthenticated) simulateUnauthenticated();

    const { getLocation } = navigateTo("/login", { state });

    const getSpinner = () => screen.queryByRole("progressbar");

    const getForm = () => screen.getByRole("form", { name: /log in/i });

    const getUsernameInput = () => {
        const group = within(getForm()).getByRole("group", {
            name: /username/i,
        });
        return {
            input: within(group).getByRole("textbox"),
            error: within(group).queryByRole("alert"),
        };
    };

    const getPasswordInput = () => {
        const group = within(getForm()).getByRole("group", {
            name: /password/i,
        });
        return {
            input: within(group).getByLabelText(/password/i),
            error: within(group).queryByRole("alert"),
        };
    };

    const getLogInButton = () =>
        within(getForm()).getByRole("button", { name: /log in/i });

    const getError = () => within(getForm()).queryByRole("alert");

    const getSignUpButton = () =>
        within(screen.getByRole("main")).getByRole("button", {
            name: /sign up/i,
        });

    const user = userEvent.setup();

    const waitForDataToLoad = () =>
        waitFor(() => expect(getSpinner()).not.toBeInTheDocument(), {
            timeout: 5000,
        });

    const fillForm = async () => {
        await user.type(
            getUsernameInput().input,
            getOwnProfile().user.username
        );
        await user.type(getPasswordInput().input, CORRECT_PASSWORD);
    };

    const submitForm = () => user.click(getLogInButton());

    return {
        getLocation,
        getSpinner,
        getForm,
        getUsernameInput,
        getPasswordInput,
        getLogInButton,
        getError,
        getSignUpButton,
        user,
        waitForDataToLoad,
        fillForm,
        submitForm,
    };
}
