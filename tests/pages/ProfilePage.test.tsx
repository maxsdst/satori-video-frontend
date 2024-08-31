import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Like from "../../src/entities/Like";
import Profile from "../../src/entities/Profile";
import Video from "../../src/entities/Video";
import {
    db,
    getOwnProfile,
    setFollowedProfiles,
    setFollowers,
} from "../mocks/db";
import { BASE_URL } from "../mocks/handlers/constants";
import {
    createProfile,
    createProfiles,
    createVideos,
    isFollowing,
    navigateTo,
    simulateDelay,
    simulateScrollToEnd,
    simulateUnauthenticated,
    sort,
} from "../utils";

describe("ProfilePage", () => {
    const PROFILE_LIST_MODAL_PAGE_SIZE = 10;
    const VIDEO_SEQUENCE_PAGE_SIZE = 10;

    let profile: Profile;

    beforeEach(() => {
        profile = createProfile({});
    });

    describe("loading", () => {
        it("should show spinner while loading", () => {
            const { getSpinner } = navigateToPage(profile.user.username);

            expect(getSpinner()).toBeInTheDocument();
        });

        it("should hide spinner after loading is complete", async () => {
            const { waitForDataToLoad, getSpinner } = navigateToPage(
                profile.user.username
            );
            await waitForDataToLoad();

            expect(getSpinner()).not.toBeInTheDocument();
        });
    });

    describe("profile", () => {
        describe("avatar", () => {
            it("should render the avatar", async () => {
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();

                const { avatar } = getProfileComponents();
                expect(avatar).toBeInTheDocument();
                expect(avatar).toHaveAttribute("src", profile.avatar);
            });
        });

        describe("username", () => {
            it("should render the username", async () => {
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();

                const { username } = getProfileComponents();
                expect(username).toBeInTheDocument();
                expect(username).toHaveTextContent(`@${profile.user.username}`);
            });
        });

        describe("full name", () => {
            it("should render the full name", async () => {
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();

                const { fullName } = getProfileComponents();
                expect(fullName).toBeInTheDocument();
                expect(fullName).toHaveTextContent(profile.full_name);
            });
        });

        describe("description", () => {
            it("should render the description", async () => {
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();

                const { description } = getProfileComponents();
                expect(description).toBeInTheDocument();
                expect(description).toHaveTextContent(profile.description);
            });
        });

        describe("following count", () => {
            it("should render the following count", async () => {
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();

                const { followingCount } = getProfileComponents();
                expect(followingCount).toBeInTheDocument();
                expect(followingCount).toHaveTextContent(
                    profile.following_count.toString()
                );
            });

            it("should show the following modal when the count is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getProfileComponents,
                    getFollowingModal,
                    user,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                expect(getFollowingModal().modal).not.toBeInTheDocument();

                await user.click(getProfileComponents().followingCount!);

                expect(getFollowingModal().modal).toBeInTheDocument();
            });
        });

        describe("following modal", () => {
            it("should render followed users", async () => {
                createProfiles(3, {}); // other profiles
                const followed = createProfiles(3, {});
                setFollowedProfiles(profile.id, followed);
                const {
                    waitForDataToLoad,
                    openFollowingModal,
                    getFollowingModal,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await openFollowingModal();

                const { items } = getFollowingModal();
                expect(items.length).toBe(3);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        followed[index].user.username
                    )
                );
            });

            it("should load more users on scroll", async () => {
                const followed = createProfiles(
                    PROFILE_LIST_MODAL_PAGE_SIZE * 3,
                    {}
                );
                setFollowedProfiles(profile.id, followed);
                const {
                    waitForDataToLoad,
                    openFollowingModal,
                    getFollowingModal,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await openFollowingModal();
                const { scroll } = getFollowingModal();
                let items = getFollowingModal().items;
                expect(items.length).toBe(PROFILE_LIST_MODAL_PAGE_SIZE);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        followed[index].user.username
                    )
                );

                await scroll();
                await waitFor(() => {
                    items = getFollowingModal().items;
                    expect(items.length).toBe(PROFILE_LIST_MODAL_PAGE_SIZE * 2);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(
                            followed[index].user.username
                        )
                    );
                });

                await scroll();
                await waitFor(() => {
                    items = getFollowingModal().items;
                    expect(items.length).toBe(PROFILE_LIST_MODAL_PAGE_SIZE * 3);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(
                            followed[index].user.username
                        )
                    );
                });
            });

            it("should close the modal when the close button is clicked", async () => {
                const {
                    waitForDataToLoad,
                    openFollowingModal,
                    getFollowingModal,
                    user,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await openFollowingModal();
                expect(getFollowingModal().modal).toBeInTheDocument();

                await user.click(getFollowingModal().closeButton!);

                await waitFor(() =>
                    expect(getFollowingModal().modal).not.toBeInTheDocument()
                );
            });
        });

        describe("follower count", () => {
            it("should render the follower count", async () => {
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();

                const { followerCount } = getProfileComponents();
                expect(followerCount).toBeInTheDocument();
                expect(followerCount).toHaveTextContent(
                    profile.follower_count.toString()
                );
            });

            it("should show the followers modal when the count is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getProfileComponents,
                    getFollowersModal,
                    user,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                expect(getFollowersModal().modal).not.toBeInTheDocument();

                await user.click(getProfileComponents().followerCount!);

                expect(getFollowersModal().modal).toBeInTheDocument();
            });
        });

        describe("followers modal", () => {
            it("should render followers", async () => {
                createProfiles(3, {}); // other profiles
                const followers = createProfiles(3, {});
                setFollowers(profile.id, followers);
                const {
                    waitForDataToLoad,
                    openFollowersModal,
                    getFollowersModal,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await openFollowersModal();

                const { items } = getFollowersModal();
                expect(items.length).toBe(3);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        followers[index].user.username
                    )
                );
            });

            it("should load more users on scroll", async () => {
                const followers = createProfiles(
                    PROFILE_LIST_MODAL_PAGE_SIZE * 3,
                    {}
                );
                setFollowers(profile.id, followers);
                const {
                    waitForDataToLoad,
                    openFollowersModal,
                    getFollowersModal,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await openFollowersModal();
                const { scroll } = getFollowersModal();
                let items = getFollowersModal().items;
                expect(items.length).toBe(PROFILE_LIST_MODAL_PAGE_SIZE);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(
                        followers[index].user.username
                    )
                );

                await scroll();
                await waitFor(() => {
                    items = getFollowersModal().items;
                    expect(items.length).toBe(PROFILE_LIST_MODAL_PAGE_SIZE * 2);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(
                            followers[index].user.username
                        )
                    );
                });

                await scroll();
                await waitFor(() => {
                    items = getFollowersModal().items;
                    expect(items.length).toBe(PROFILE_LIST_MODAL_PAGE_SIZE * 3);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(
                            followers[index].user.username
                        )
                    );
                });
            });

            it("should close the modal when the close button is clicked", async () => {
                const {
                    waitForDataToLoad,
                    openFollowersModal,
                    getFollowersModal,
                    user,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await openFollowersModal();
                expect(getFollowersModal().modal).toBeInTheDocument();

                await user.click(getFollowersModal().closeButton!);

                await waitFor(() =>
                    expect(getFollowersModal().modal).not.toBeInTheDocument()
                );
            });
        });

        describe("edit profile button", () => {
            it("should render the button if profile belongs to the current user", async () => {
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(getOwnProfile().user.username);
                await waitForDataToLoad();

                expect(
                    getProfileComponents().editProfileButton
                ).toBeInTheDocument();
            });

            it("should not render the button if profile belongs to another user", async () => {
                const profile = createProfile({});
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();

                expect(
                    getProfileComponents().editProfileButton
                ).not.toBeInTheDocument();
            });

            it("should show the edit profile modal when the button is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getProfileComponents,
                    getEditProfileModal,
                    user,
                } = navigateToPage(getOwnProfile().user.username);
                await waitForDataToLoad();
                expect(getEditProfileModal()).not.toBeInTheDocument();

                await user.click(getProfileComponents().editProfileButton!);

                expect(getEditProfileModal()).toBeInTheDocument();
            });
        });

        describe("follow button", () => {
            it("should render the button if profile belongs to another user", async () => {
                const profile = createProfile({});
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();

                expect(getProfileComponents().followButton).toBeInTheDocument();
            });

            it("should not render the button if profile belongs to the current user", async () => {
                const { waitForDataToLoad, getProfileComponents } =
                    navigateToPage(getOwnProfile().user.username);
                await waitForDataToLoad();

                expect(
                    getProfileComponents().followButton
                ).not.toBeInTheDocument();
            });

            it("should follow/unfollow the profile when the button is clicked", async () => {
                const { waitForDataToLoad, getProfileComponents, user } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();
                expect(isFollowing(profile.id)).toBe(false);

                await user.click(getProfileComponents().followButton!);
                expect(isFollowing(profile.id)).toBe(true);

                await user.click(getProfileComponents().unfollowButton!);
                expect(isFollowing(profile.id)).toBe(false);
            });

            it("should show login request modal when the button is clicked if user is not authenticated", async () => {
                simulateUnauthenticated();
                const {
                    waitForDataToLoad,
                    getProfileComponents,
                    getLoginRequestModal,
                    user,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                expect(getLoginRequestModal()).not.toBeInTheDocument();

                await user.click(getProfileComponents().followButton!);

                expect(getLoginRequestModal()).toBeInTheDocument();
            });
        });
    });

    describe("videos section", () => {
        describe("tabs", () => {
            it("should render tabs", async () => {
                const { waitForDataToLoad, getTabs } = navigateToPage(
                    profile.user.username
                );
                await waitForDataToLoad();

                const { videosTab, likedTab } = getTabs();
                expect(videosTab).toBeInTheDocument();
                expect(likedTab).toBeInTheDocument();
            });

            it("should have the videos tab active initially", async () => {
                const {
                    waitForDataToLoad,
                    getVideosTabPanel,
                    getLikedTabPanel,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();

                expect(getVideosTabPanel().panel).toBeInTheDocument();
                expect(getLikedTabPanel().panel).not.toBeInTheDocument();
            });

            it("should show the videos tab panel when the videos tab is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getTabs,
                    getVideosTabPanel,
                    switchToLikedTab,
                    user,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await switchToLikedTab();
                expect(getVideosTabPanel().panel).not.toBeInTheDocument();

                await user.click(getTabs().videosTab!);

                expect(getVideosTabPanel().panel).toBeInTheDocument();
            });

            it("should show the liked tab panel when the liked tab is clicked", async () => {
                const { waitForDataToLoad, getTabs, getLikedTabPanel, user } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();
                expect(getLikedTabPanel().panel).not.toBeInTheDocument();

                await user.click(getTabs().likedTab!);

                expect(getLikedTabPanel().panel).toBeInTheDocument();
            });
        });

        describe("videos tab", () => {
            it("should show spinner while loading", async () => {
                simulateDelay(BASE_URL + "/videos/videos/", "get");
                const { waitForDataToLoad, getVideosTabPanel } = navigateToPage(
                    profile.user.username
                );
                await waitForDataToLoad();

                expect(getVideosTabPanel().spinner).toBeInTheDocument();
            });

            it("should hide spinner after loading is complete", async () => {
                const { waitForDataToLoad, getVideosTabPanel } = navigateToPage(
                    profile.user.username
                );
                await waitForDataToLoad();

                expect(getVideosTabPanel().spinner).not.toBeInTheDocument();
            });

            it("should render video grid with user's videos ordered by newest first", async () => {
                createVideos(3, {}); // other videos
                const videos = createVideos(3, { profile });
                sort(videos, "upload_date", "desc");
                const { waitForDataToLoad, getVideosTabPanel } = navigateToPage(
                    profile.user.username
                );
                await waitForDataToLoad();

                const { items } = getVideosTabPanel();
                expect(items.length).toBe(3);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(videos[index].title)
                );
            });

            it("should redirect to the video page with user's videos when an item is clicked", async () => {
                createVideos(3, {}); // other videos
                const videos = createVideos(3, { profile });
                sort(videos, "upload_date", "desc");
                const {
                    getLocation,
                    waitForDataToLoad,
                    getVideosTabPanel,
                    getVideoItemComponents,
                    getPlayers,
                    user,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                const pathname = `/videos/${videos[0].id}`;
                expect(getLocation().pathname).not.toBe(pathname);

                const item = getVideosTabPanel().items[0];
                await user.click(getVideoItemComponents(item).thumbnail!);

                expect(getLocation().pathname).toBe(pathname);
                const players = getPlayers();
                players.forEach((player, index) =>
                    expect(player).toHaveTextContent(videos[index].title)
                );
            });

            it("should load more videos on scroll", async () => {
                const videos = createVideos(VIDEO_SEQUENCE_PAGE_SIZE * 3, {
                    profile,
                });
                sort(videos, "upload_date", "desc");
                const { waitForDataToLoad, getVideosTabPanel, scrollPage } =
                    navigateToPage(profile.user.username);
                await waitForDataToLoad();
                let items = getVideosTabPanel().items;
                expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(videos[index].title)
                );

                await scrollPage();
                await waitFor(() => {
                    items = getVideosTabPanel().items;
                    expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE * 2);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(videos[index].title)
                    );
                });

                await scrollPage();
                await waitFor(() => {
                    items = getVideosTabPanel().items;
                    expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE * 3);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(videos[index].title)
                    );
                });
            });
        });

        describe("liked tab", () => {
            it("should show spinner while loading", async () => {
                simulateDelay(BASE_URL + "/videos/likes/", "get");
                const {
                    waitForDataToLoad,
                    getLikedTabPanel,
                    switchToLikedTab,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await switchToLikedTab();

                expect(getLikedTabPanel().spinner).toBeInTheDocument();
            });

            it("should hide spinner after loading is complete", async () => {
                const {
                    waitForDataToLoad,
                    getLikedTabPanel,
                    switchToLikedTab,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await switchToLikedTab();

                expect(getLikedTabPanel().spinner).not.toBeInTheDocument();
            });

            it("should render video grid with user's liked videos", async () => {
                createVideos(3, {}); // other videos
                const videos = createVideos(3, {});
                createLikes(profile, videos);
                const {
                    waitForDataToLoad,
                    getLikedTabPanel,
                    switchToLikedTab,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await switchToLikedTab();

                const { items } = getLikedTabPanel();
                expect(items.length).toBe(3);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(videos[index].title)
                );
            });

            it("should render avatars and usernames", async () => {
                const videos = createVideos(3, {});
                createLikes(profile, videos);
                const {
                    waitForDataToLoad,
                    getLikedTabPanel,
                    getVideoItemComponents,
                    switchToLikedTab,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await switchToLikedTab();

                const { items } = getLikedTabPanel();
                items.forEach((item) => {
                    const { authorAvatar, authorUsername } =
                        getVideoItemComponents(item);
                    expect(authorAvatar).toBeInTheDocument();
                    expect(authorUsername).toBeInTheDocument();
                });
            });

            it("should redirect to the video page with user's liked videos when an item is clicked", async () => {
                createVideos(3, {}); // other videos
                const videos = createVideos(3, {});
                createLikes(profile, videos);
                const {
                    getLocation,
                    waitForDataToLoad,
                    getLikedTabPanel,
                    getVideoItemComponents,
                    getPlayers,
                    user,
                    switchToLikedTab,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await switchToLikedTab();
                const pathname = `/videos/${videos[0].id}`;
                expect(getLocation().pathname).not.toBe(pathname);

                const item = getLikedTabPanel().items[0];
                await user.click(getVideoItemComponents(item).thumbnail!);

                expect(getLocation().pathname).toBe(pathname);
                const players = getPlayers();
                players.forEach((player, index) =>
                    expect(player).toHaveTextContent(videos[index].title)
                );
            });

            it("should load more videos on scroll", async () => {
                const videos = createVideos(VIDEO_SEQUENCE_PAGE_SIZE * 3, {});
                createLikes(profile, videos);
                const {
                    waitForDataToLoad,
                    getLikedTabPanel,
                    scrollPage,
                    switchToLikedTab,
                } = navigateToPage(profile.user.username);
                await waitForDataToLoad();
                await switchToLikedTab();
                let items = getLikedTabPanel().items;
                expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(videos[index].title)
                );

                await scrollPage();
                await waitFor(() => {
                    items = getLikedTabPanel().items;
                    expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE * 2);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(videos[index].title)
                    );
                });

                await scrollPage();
                await waitFor(() => {
                    items = getLikedTabPanel().items;
                    expect(items.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE * 3);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(videos[index].title)
                    );
                });
            });
        });
    });
});

function navigateToPage(username: string) {
    const { getLocation } = navigateTo("/users/" + username);

    const getSpinner = () =>
        screen.queryByRole("progressbar", { name: /loading profile/i });

    const getProfileComponents = () => {
        const profile = screen.queryByTestId("profile");
        return {
            avatar: profile && within(profile).queryByLabelText(/avatar/i),
            username: profile && within(profile).queryByLabelText(/username/i),
            fullName: profile && within(profile).queryByLabelText(/full name/i),
            description:
                profile && within(profile).queryByLabelText(/description/i),
            followerCount:
                profile && within(profile).queryByLabelText(/followers/i),
            followingCount:
                profile && within(profile).queryByLabelText(/followed/i),
            editProfileButton:
                profile &&
                within(profile).queryByRole("button", {
                    name: /edit profile/i,
                }),
            followButton:
                profile &&
                within(profile).queryByRole("button", { name: "Follow" }),
            unfollowButton:
                profile &&
                within(profile).queryByRole("button", { name: "Unfollow" }),
        };
    };

    const getProfileListModal = (name: string | RegExp) => {
        const modal = screen.queryByRole("dialog", { name });
        const userListContainer =
            modal && within(modal).queryByTestId("user-list-container");
        const list =
            modal && within(modal).getByRole("list", { name: /users/i });
        return {
            modal,
            closeButton:
                modal &&
                within(modal).queryByRole("button", { name: /close/i }),
            items: list ? within(list).queryAllByRole("listitem") : [],
            scroll: () =>
                userListContainer && simulateScrollToEnd(userListContainer),
        };
    };

    const getFollowingModal = () => getProfileListModal(/following/i);
    const getFollowersModal = () => getProfileListModal(/followers/i);

    const getEditProfileModal = () =>
        screen.queryByRole("dialog", { name: /edit profile/i });

    const getLoginRequestModal = () =>
        screen.queryByTestId("login-request-modal");

    const getTabs = () => {
        const tablist = screen.queryByRole("tablist");
        return {
            videosTab:
                tablist &&
                within(tablist).getByRole("tab", { name: /videos/i }),
            likedTab:
                tablist && within(tablist).getByRole("tab", { name: /liked/i }),
        };
    };

    const getVideosTabPanel = () => {
        const panel = screen.queryByRole("tabpanel", { name: /videos/i });
        return {
            panel,
            spinner: panel && within(panel).queryByRole("progressbar"),
            items: panel
                ? within(panel).queryAllByTestId("video-grid-item")
                : [],
        };
    };

    const getLikedTabPanel = () => {
        const panel = screen.queryByRole("tabpanel", { name: /liked/i });
        return {
            panel,
            spinner: panel && within(panel).queryByRole("progressbar"),
            items: panel
                ? within(panel).queryAllByTestId("video-grid-item")
                : [],
        };
    };

    const getVideoItemComponents = (item: HTMLElement) => {
        return {
            thumbnail: within(item).queryByRole("img", { name: /thumbnail/i }),
            authorAvatar: within(item).queryByRole("img", { name: /avatar/i }),
            authorUsername: within(item).queryByLabelText(/username/i),
            likeCount: within(item).queryByLabelText(/likes/i),
            actionMenuButton: within(item).queryByRole("button", {
                name: /action menu/i,
            }),
        };
    };

    const getPlayers = () => screen.queryAllByTestId("player");

    const user = userEvent.setup();

    const waitForDataToLoad = () =>
        waitFor(() =>
            expect(getProfileComponents().username).toBeInTheDocument()
        );

    const openFollowingModal = () =>
        user.click(getProfileComponents().followingCount!);
    const openFollowersModal = () =>
        user.click(getProfileComponents().followerCount!);

    const switchToLikedTab = () => user.click(getTabs().likedTab!);

    const scrollPage = () => simulateScrollToEnd();

    return {
        getLocation,
        getSpinner,
        waitForDataToLoad,
        getProfileComponents,
        getFollowingModal,
        getFollowersModal,
        getEditProfileModal,
        getLoginRequestModal,
        getTabs,
        getVideosTabPanel,
        getLikedTabPanel,
        getVideoItemComponents,
        getPlayers,
        user,
        openFollowingModal,
        openFollowersModal,
        switchToLikedTab,
        scrollPage,
    };
}

function createLikes(profile: Profile, videos: Video[]): Like[] {
    return videos.map((video) => db.like.create({ profile, video }) as Like);
}
