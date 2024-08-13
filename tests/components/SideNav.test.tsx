import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import SideNav from "../../src/components/SideNav";
import { renderWithRouter } from "../utils";

const items: { name: string; pathname: string }[] = [
    { name: "For you", pathname: "/" },
    { name: "Popular", pathname: "/popular" },
    { name: "Latest", pathname: "/latest" },
    { name: "Following", pathname: "/following" },
    { name: "Saved", pathname: "/saved" },
    { name: "History", pathname: "/history" },
    { name: "My videos", pathname: "/my_videos" },
];

describe("SideNav", () => {
    it.each(items)("should render $name item", ({ name }) => {
        const { getItem } = renderComponent({});

        expect(getItem(name)).toBeInTheDocument();
    });

    it.each(items)(
        "should redirect to $pathname when $name item is clicked",
        async ({ name, pathname }) => {
            const { getItem, getLocation, user } = renderComponent({});
            expect(getLocation().pathname).not.toBe(pathname);

            await user.click(getItem(name)!);

            expect(getLocation().pathname).toBe(pathname);
        }
    );

    it("should call onClose when an item is clicked if isFullscreen is set to true", async () => {
        const { getItem, onClose, user } = renderComponent({
            isFullscreen: true,
        });
        expect(onClose).not.toBeCalled();

        await user.click(getItem(items[0].name)!);

        expect(onClose).toBeCalledTimes(1);
    });

    it("should not call onClose when an item is clicked if isFullscreen is set to false", async () => {
        const { getItem, onClose, user } = renderComponent({
            isFullscreen: false,
        });
        expect(onClose).not.toBeCalled();

        await user.click(getItem(items[0].name)!);

        expect(onClose).not.toBeCalled();
    });
});

interface Props {
    isFullscreen?: boolean;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        isFullscreen: false,
    };

    const onClose = vi.fn();

    const { getLocation } = renderWithRouter(
        <SideNav {...{ ...defaults, ...props }} onClose={onClose} />,
        useAppRoutes
    );

    const getItem = (name: string) => screen.queryByRole("button", { name });

    const user = userEvent.setup();

    return {
        getLocation,
        getItem,
        onClose,
        user,
    };
}
