import { faker } from "@faker-js/faker";
import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { CORRECT_PASSWORD } from "../mocks/db";
import { didLogIn } from "../mocks/handlers/auth";
import { BASE_URL } from "../mocks/handlers/constants";
import {
    getProfileByUsername,
    navigateTo,
    simulateError,
    simulateUnauthenticated,
} from "../utils";

describe("SignupPage", () => {
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
            const { waitForDataToLoad, getLocation } = navigateToPage(true);
            expect(getLocation().pathname).not.toBe("/");

            await waitForDataToLoad();

            expect(getLocation().pathname).toBe("/");
        });
    });

    describe("signup form", () => {
        it("should render the signup form", async () => {
            const { waitForDataToLoad, getForm } = navigateToPage();
            await waitForDataToLoad();

            expect(getForm()).toBeInTheDocument();
        });

        describe("email input", () => {
            it("should render the input", async () => {
                const { waitForDataToLoad, getEmailInput } = navigateToPage();
                await waitForDataToLoad();

                expect(getEmailInput().input).toBeInTheDocument();
            });

            it("should show error message on submit if value is not a valid email", async () => {
                const { waitForDataToLoad, getEmailInput, user, submitForm } =
                    navigateToPage();
                await waitForDataToLoad();
                await user.type(getEmailInput().input, "atkins@");
                expect(getEmailInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getEmailInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/valid email/i);
            });
        });

        describe("full name input", () => {
            it("should render the input", async () => {
                const { waitForDataToLoad, getFullNameInput } =
                    navigateToPage();
                await waitForDataToLoad();

                expect(getFullNameInput().input).toBeInTheDocument();
            });

            it("should show error message on submit if value is empty", async () => {
                const { waitForDataToLoad, getFullNameInput, submitForm } =
                    navigateToPage();
                await waitForDataToLoad();
                expect(getFullNameInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getFullNameInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/required/i);
            });
        });

        describe("username input", () => {
            it("should render the input", async () => {
                const { waitForDataToLoad, getUsernameInput } =
                    navigateToPage();
                await waitForDataToLoad();

                expect(getUsernameInput().input).toBeInTheDocument();
            });

            it("should show error message on submit if value is shorter than 3 chars", async () => {
                const {
                    waitForDataToLoad,
                    getUsernameInput,
                    user,
                    submitForm,
                } = navigateToPage();
                await waitForDataToLoad();
                await user.type(getUsernameInput().input, "at");
                expect(getUsernameInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getUsernameInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/characters long/i);
            });
        });

        describe("password input", () => {
            it("should render the input", async () => {
                const { waitForDataToLoad, getPasswordInput } =
                    navigateToPage();
                await waitForDataToLoad();

                expect(getPasswordInput().input).toBeInTheDocument();
            });

            it("should show error message on submit if value is shorter than 8 chars", async () => {
                const {
                    waitForDataToLoad,
                    getPasswordInput,
                    user,
                    submitForm,
                } = navigateToPage();
                await waitForDataToLoad();
                await user.type(getPasswordInput().input, "atkins1");
                expect(getPasswordInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getPasswordInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/characters long/i);
            });
        });

        describe("sign up button", () => {
            it("should render the sign up button", async () => {
                const { waitForDataToLoad, getSignUpButton } = navigateToPage();
                await waitForDataToLoad();

                expect(getSignUpButton()).toBeInTheDocument();
            });
        });

        describe("signup", () => {
            it("should create profile on submit", async () => {
                const { waitForDataToLoad, fillForm, submitForm } =
                    navigateToPage();
                await waitForDataToLoad();
                const { username, fullName } = await fillForm();
                expect(getProfileByUsername(username)).toBe(null);

                await submitForm();

                const profile = getProfileByUsername(username);
                expect(profile).not.toBe(null);
                expect(profile?.full_name).toBe(fullName);
            });

            it("should log in and redirect to the home page if signup succeeded", async () => {
                const { waitForDataToLoad, fillForm, submitForm, getLocation } =
                    navigateToPage();
                await waitForDataToLoad();
                expect(didLogIn()).toBe(false);
                expect(getLocation().pathname).not.toBe("/");

                await fillForm();
                await submitForm();

                expect(didLogIn()).toBe(true);
                expect(getLocation().pathname).toBe("/");
            });

            it("should show error messages if signup failed", async () => {
                const emailError = "email error 123";
                const fullNameError = "full name error 123";
                const usernameError = "username error 123";
                const passwordError = "password error 123";
                simulateError(BASE_URL + "/auth/users/", "post", {
                    body: {
                        email: [emailError],
                        full_name: [fullNameError],
                        username: [usernameError],
                        password: [passwordError],
                    },
                });
                const {
                    waitForDataToLoad,
                    fillForm,
                    submitForm,
                    getEmailInput,
                    getFullNameInput,
                    getUsernameInput,
                    getPasswordInput,
                } = navigateToPage();
                await waitForDataToLoad();

                await fillForm();
                await submitForm();

                let error = getEmailInput().error;
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(emailError);
                error = getFullNameInput().error;
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(fullNameError);
                error = getUsernameInput().error;
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(usernameError);
                error = getPasswordInput().error;
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(passwordError);
            });
        });
    });

    describe("log in button", () => {
        it("should render the log in button", async () => {
            const { waitForDataToLoad, getLogInButton } = navigateToPage();
            await waitForDataToLoad();

            expect(getLogInButton()).toBeInTheDocument();
        });

        it("should redirect to the login page when the log in button is clicked", async () => {
            const { waitForDataToLoad, getLocation, getLogInButton, user } =
                navigateToPage();
            await waitForDataToLoad();
            expect(getLocation().pathname).not.toBe("/login");

            await user.click(getLogInButton());

            expect(getLocation().pathname).toBe("/login");
        });
    });
});

function navigateToPage(isAuthenticated: boolean = false) {
    if (!isAuthenticated) simulateUnauthenticated();

    const { getLocation } = navigateTo("/signup");

    const getSpinner = () => screen.queryByRole("progressbar");

    const getForm = () => screen.getByRole("form", { name: /sign up/i });

    const getEmailInput = () => {
        const group = within(getForm()).getByRole("group", { name: /email/i });
        return {
            input: within(group).getByRole("textbox"),
            error: within(group).queryByRole("alert"),
        };
    };

    const getFullNameInput = () => {
        const group = within(getForm()).getByRole("group", {
            name: /full name/i,
        });
        return {
            input: within(group).getByRole("textbox"),
            error: within(group).queryByRole("alert"),
        };
    };

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

    const getSignUpButton = () =>
        within(getForm()).getByRole("button", { name: /sign up/i });

    const getLogInButton = () =>
        within(screen.getByRole("main")).getByRole("button", {
            name: /log in/i,
        });

    const user = userEvent.setup();

    const waitForDataToLoad = () =>
        waitFor(() => expect(getSpinner()).not.toBeInTheDocument(), {
            timeout: 5000,
        });

    const fillForm = async () => {
        const email = faker.internet.email();
        const fullName = faker.person.fullName();
        const username = faker.internet.userName();
        const password = CORRECT_PASSWORD;
        await user.type(getEmailInput().input, email);
        await user.type(getFullNameInput().input, fullName);
        await user.type(getUsernameInput().input, username);
        await user.type(getPasswordInput().input, password);
        return { email, fullName, username, password };
    };

    const submitForm = () => user.click(getSignUpButton());

    return {
        getLocation,
        getSpinner,
        getForm,
        getEmailInput,
        getFullNameInput,
        getUsernameInput,
        getPasswordInput,
        getSignUpButton,
        getLogInButton,
        user,
        waitForDataToLoad,
        fillForm,
        submitForm,
    };
}
