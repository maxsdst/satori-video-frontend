import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import ProfileList from "../../src/components/ProfileList";
import Profile from "../../src/entities/Profile";
import { createProfile, createProfiles, renderWithRouter } from "../utils";

describe("ProfileList", () => {
    it("should render avatars", () => {
        const profiles = createProfiles(3, {});
        const { items, getItemComponents } = renderComponent({ profiles });

        items.forEach((item, index) => {
            const { avatar } = getItemComponents(item);
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute("src", profiles[index].avatar);
        });
    });

    it("should render usernames", () => {
        const profiles = createProfiles(3, {});
        const { items, getItemComponents } = renderComponent({ profiles });

        items.forEach((item, index) => {
            const { username } = getItemComponents(item);
            expect(username).toBeInTheDocument();
            expect(username).toHaveTextContent(profiles[index].user.username);
        });
    });

    it("should render full names", () => {
        const profiles = createProfiles(3, {});
        const { items, getItemComponents } = renderComponent({ profiles });

        items.forEach((item, index) => {
            const { fullName } = getItemComponents(item);
            expect(fullName).toBeInTheDocument();
            expect(fullName).toHaveTextContent(profiles[index].full_name);
        });
    });

    it("should render descriptions", () => {
        const profiles = createProfiles(3, {});
        const { items, getItemComponents } = renderComponent({ profiles });

        items.forEach((item, index) => {
            const { description } = getItemComponents(item);
            expect(description).toBeInTheDocument();
            expect(description).toHaveTextContent(profiles[index].description);
        });
    });

    it("should render follower counts", () => {
        const profiles = createProfiles(3, {});
        const { items, getItemComponents } = renderComponent({ profiles });

        items.forEach((item, index) => {
            const { followerCount } = getItemComponents(item);
            expect(followerCount).toBeInTheDocument();
            expect(followerCount).toHaveTextContent(
                profiles[index].follower_count.toString()
            );
        });
    });

    it("should redirect to the profile page when an item is clicked", async () => {
        const profile = createProfile({});
        const pathname = `/users/${profile.user.username}`;
        const { items, getLocation, user } = renderComponent({
            profiles: [profile],
        });
        expect(getLocation().pathname).not.toBe(pathname);

        await user.click(items[0]);

        expect(getLocation().pathname).toBe(pathname);
    });
});

interface Props {
    profiles: Profile[];
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const { getLocation } = renderWithRouter(
        <ProfileList {...props} />,
        useAppRoutes
    );

    const list = screen.getByRole("list", { name: /users/i });
    const items = within(list).getAllByRole("listitem");

    const getItemComponents = (item: HTMLElement) => {
        return {
            avatar: within(item).queryByLabelText(/avatar/i),
            username: within(item).queryByLabelText(/username/i),
            fullName: within(item).queryByLabelText(/full name/i),
            description: within(item).queryByLabelText(/description/i),
            followerCount: within(item).queryByLabelText(/followers/i),
        };
    };

    const user = userEvent.setup();

    return {
        getLocation,
        items,
        getItemComponents,
        user,
    };
}
