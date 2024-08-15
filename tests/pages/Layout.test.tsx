import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import Layout from "../../src/pages/Layout";
import { renderWithRouter, simulateScreenSize } from "../utils";

describe("Layout", () => {
    it("should render children", () => {
        const text = "abc 123";
        renderComponent({ children: text });

        expect(screen.queryByRole("main")).toHaveTextContent(text);
    });

    it("should render the topnav", () => {
        const { topnav } = renderComponent({});

        expect(topnav).toBeInTheDocument();
    });

    it("should render the sidenav on screens lg and above", async () => {
        await simulateScreenSize("lg", () => {
            const { getSidenav } = renderComponent({});

            expect(getSidenav()).toBeInTheDocument();
        });
    });

    it("should not render the sidenav on screens below lg", async () => {
        await simulateScreenSize("md", () => {
            const { getSidenav } = renderComponent({});

            expect(getSidenav()).not.toBeInTheDocument();
        });
    });

    it("should open/close sidenav when the navigation button is clicked", async () => {
        await simulateScreenSize("md", async () => {
            const { getSidenav, navigationButton, user } = renderComponent({});
            expect(getSidenav()).not.toBeInTheDocument();

            await user.click(navigationButton!);
            expect(getSidenav()).toBeInTheDocument();

            await user.click(navigationButton!);
            expect(getSidenav()).not.toBeInTheDocument();
        });
    });
});

interface Props {
    children?: ReactNode;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const { getLocation } = renderWithRouter(
        <Layout {...props} />,
        useAppRoutes
    );

    const topnav = screen.queryByTestId("topnav");
    const navigationButton = screen.queryByRole("button", {
        name: /navigation/i,
    });

    const getSidenav = () => screen.queryByTestId("sidenav");

    const user = userEvent.setup();

    return {
        getLocation,
        topnav,
        navigationButton,
        getSidenav,
        user,
    };
}
