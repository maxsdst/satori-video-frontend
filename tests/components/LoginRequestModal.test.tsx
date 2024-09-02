import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import LoginRequestModal from "../../src/components/LoginRequestModal";
import { CORRECT_PASSWORD, getOwnProfile } from "../mocks/db";
import { renderWithRouter, simulateUnauthenticated } from "../utils";

describe("LoginRequestModal", () => {
    describe("initial state", () => {
        it("should not render modal when isOpen prop is set to false", () => {
            const { getModal } = renderComponent({ isOpen: false });

            expect(getModal()).not.toBeInTheDocument();
        });

        it("should render modal when isOpen prop is set to true", () => {
            const { getModal } = renderComponent({ isOpen: true });

            expect(getModal()).toBeInTheDocument();
        });
    });

    describe("content", () => {
        it("should render the header", () => {
            const text = "test 123";
            const { getHeader } = renderComponent({ header: text });

            const header = getHeader();
            expect(header).toBeInTheDocument();
            expect(header).toHaveTextContent(text);
        });

        it("should render children", () => {
            const text = "123 test";
            const { getModal } = renderComponent({ children: text });

            expect(getModal()).toHaveTextContent(text);
        });
    });

    describe("close button", () => {
        it("should render the close button", () => {
            const { getCloseButton } = renderComponent({});

            expect(getCloseButton()).toBeInTheDocument();
        });

        it("should call onClose when the button is clicked", async () => {
            const { getCloseButton, onClose, user } = renderComponent({});
            expect(onClose).not.toBeCalled();

            await user.click(getCloseButton()!);

            expect(onClose).toBeCalled();
        });
    });

    describe("sign in button", () => {
        it("should render the sign in button", () => {
            const { getSignInButton } = renderComponent({});

            expect(getSignInButton()).toBeInTheDocument();
        });

        it("should redirect to the login page when the button is clicked", async () => {
            const { getSignInButton, user, getLocation } = renderComponent({});

            await user.click(getSignInButton()!);

            expect(getLocation().pathname).toBe("/login");
        });
    });

    describe("logging in", () => {
        it("should redirect to the previous page after logging in", async () => {
            simulateUnauthenticated();
            const { getSignInButton, getLoginForm, user, getLocation } =
                renderComponent({}, true);
            const initialLocation = getLocation().pathname;
            await user.click(getSignInButton()!);
            expect(getLocation().pathname).toBe("/login");
            expect(initialLocation).not.toBe("/login");

            const { usernameInput, passwordInput, submitButton } =
                getLoginForm();
            await user.type(usernameInput!, getOwnProfile().user.username);
            await user.type(passwordInput!, CORRECT_PASSWORD);
            await user.click(submitButton!);

            expect(getLocation().pathname).toBe(initialLocation);
        });
    });
});

interface Props {
    isOpen?: boolean;
    header?: string;
    children?: ReactNode;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        isOpen: true,
        header: "",
        children: null,
    };

    const onClose = vi.fn();

    const { getLocation } = renderWithRouter(
        <LoginRequestModal {...{ ...defaults, ...props }} onClose={onClose} />,
        useAppRoutes
    );

    const getModal = () => screen.queryByRole("dialog");
    const getHeader = () => within(getModal()!).queryByRole("banner");
    const getCloseButton = () =>
        within(getModal()!).queryByRole("button", { name: /close/i });
    const getSignInButton = () =>
        within(getModal()!).queryByRole("button", { name: /sign in/i });

    const getLoginForm = () => {
        const form = screen.queryByRole("form", { name: /log in/i })!;
        const usernameGroup = within(form).queryByRole("group", {
            name: /username/i,
        })!;
        const passwordGroup = within(form).queryByRole("group", {
            name: /password/i,
        })!;
        return {
            usernameInput: within(usernameGroup).queryByRole("textbox"),
            passwordInput: within(passwordGroup).queryByLabelText(/password/i),
            submitButton: within(form).queryByRole("button", {
                name: /log in/i,
            }),
        };
    };

    const user = userEvent.setup();

    return {
        getLocation,
        getModal,
        getHeader,
        getCloseButton,
        getSignInButton,
        getLoginForm,
        onClose,
        user,
    };
}
