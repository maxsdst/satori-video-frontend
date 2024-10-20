import {
    fireEvent,
    screen,
    waitFor,
    waitForElementToBeRemoved,
    within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VIEW_DURATION_THRESHOLD_SECONDS } from "../../src/constants";
import Video from "../../src/entities/Video";
import { VideoSource } from "../../src/pages/VideoPage";
import BaseQuery from "../../src/services/BaseQuery";
import {
    db,
    getOwnProfile,
    setFollowingVideos,
    setLatestVideos,
    setPopularVideos,
    setRecommendedVideos,
} from "../mocks/db";
import {
    countEvents,
    countViews,
    createComment,
    createProfile,
    createVideo,
    createVideos,
    navigateTo,
    simulateSwipe,
    simulateTouchDevice,
    sleep,
} from "../utils";

const VIDEO_SEQUENCE_PAGE_SIZE = 10;
const PLAYER_HEIGHT = 100;

describe("VideoPage", () => {
    let video: Video;

    beforeEach(() => {
        video = createVideo({});
    });

    describe("loading", () => {
        it("should show spinner while loading", () => {
            const { getSpinner } = navigateToPage(video.id);

            expect(getSpinner()).toBeInTheDocument();
        });

        it("should hide spinner after loading is complete", async () => {
            const { waitForDataToLoad, getSpinner } = navigateToPage(video.id);
            await waitForDataToLoad();

            expect(getSpinner()).not.toBeInTheDocument();
        });
    });

    describe("players", () => {
        it("should render video players", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, getPlayers } = navigateToPage(
                videos[0].id
            );
            await waitForDataToLoad();

            const players = getPlayers();
            expect(players.length).toBe(3);
            players.forEach((player, index) =>
                expect(player).toHaveTextContent(videos[index].title)
            );
        });

        it("should render player correctly", async () => {
            setRecommendedVideos([video]);
            const { waitForDataToLoad, getPlayers, getPlayerComponents } =
                navigateToPage(video.id);
            await waitForDataToLoad();

            const player = getPlayers()[0];
            const {
                getUnmuteButton,
                likeButton,
                commentsButton,
                moreActionsButton,
                authorAvatar,
                authorUsername,
                videoTitle,
            } = getPlayerComponents(player);
            expect(getUnmuteButton()).toBeInTheDocument();
            expect(likeButton).toBeInTheDocument();
            expect(commentsButton).toBeInTheDocument();
            expect(moreActionsButton).toBeInTheDocument();
            expect(authorAvatar).toBeInTheDocument();
            expect(authorUsername).toBeInTheDocument();
            expect(videoTitle).toBeInTheDocument();
        });
    });

    describe("playback", () => {
        it("should have current player playing and others paused initially", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, getPlayers, getPlayerComponents } =
                navigateToPage(videos[0].id);
            await waitForDataToLoad();

            const players = getPlayers();
            expect(getPlayerComponents(players[0]).video).toBeInTheDocument();
            await waitFor(() =>
                expect(getPlayerComponents(players[0]).video?.paused).toBe(
                    false
                )
            );
            expect(
                getPlayerComponents(players[1]).video
            ).not.toBeInTheDocument();
            expect(
                getPlayerComponents(players[2]).video
            ).not.toBeInTheDocument();
        });

        it("should keep only the current player playing and pause others", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const {
                waitForDataToLoad,
                getPlayers,
                getPlayerComponents,
                goToNext,
            } = navigateToPage(videos[0].id);
            await waitForDataToLoad();
            const players = getPlayers();
            expect(getPlayerComponents(players[0]).video).toBeInTheDocument();
            await waitFor(() =>
                expect(getPlayerComponents(players[0]).video?.paused).toBe(
                    false
                )
            );
            expect(
                getPlayerComponents(players[1]).video
            ).not.toBeInTheDocument();
            expect(
                getPlayerComponents(players[2]).video
            ).not.toBeInTheDocument();

            await goToNext();

            expect(
                getPlayerComponents(players[0]).video
            ).not.toBeInTheDocument();
            expect(getPlayerComponents(players[1]).video?.paused).toBe(false);
            expect(
                getPlayerComponents(players[2]).video
            ).not.toBeInTheDocument();
        });

        it("should create view after playing video for a certain period", async () => {
            setRecommendedVideos([video]);
            const { waitForDataToLoad } = navigateToPage(video.id);
            await waitForDataToLoad();
            expect(countViews(video.id)).toBe(0);

            await sleep((VIEW_DURATION_THRESHOLD_SECONDS + 1) * 1000);

            expect(countViews(video.id)).toBe(1);
        });

        it("should create view event when video is played", async () => {
            const videos = createVideos(2, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, goToNext } = navigateToPage(
                videos[0].id
            );
            expect(countEvents(videos[0].id, "view")).toBe(0);

            await waitForDataToLoad();
            expect(countEvents(videos[0].id, "view")).toBe(1);
            expect(countEvents(videos[1].id, "view")).toBe(0);

            await goToNext();
            expect(countEvents(videos[1].id, "view")).toBe(1);
        });
    });

    describe("mute state", () => {
        it("should have all players muted initially", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, getPlayers, getPlayerComponents } =
                navigateToPage(videos[0].id);
            await waitForDataToLoad();

            const players = getPlayers();
            players.forEach((player) =>
                expect(
                    getPlayerComponents(player).getUnmuteButton()
                ).toBeInTheDocument()
            );
        });

        it("should mute/unmute all players when one player's mute state changes", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, getPlayers, getPlayerComponents, user } =
                navigateToPage(videos[0].id);
            await waitForDataToLoad();
            const players = getPlayers();
            players.forEach((player) =>
                expect(
                    getPlayerComponents(player).getUnmuteButton()
                ).toBeInTheDocument()
            );

            await user.click(
                getPlayerComponents(players[0]).getUnmuteButton()!
            );
            players.forEach((player) =>
                expect(
                    getPlayerComponents(player).getMuteButton()
                ).toBeInTheDocument()
            );

            await user.click(getPlayerComponents(players[0]).getMuteButton()!);
            players.forEach((player) =>
                expect(
                    getPlayerComponents(player).getUnmuteButton()
                ).toBeInTheDocument()
            );
        });
    });

    describe("navigation", () => {
        it("should start with slide at initialVideoIndex if initialVideoIndex is set", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, validateCurrentPlayer } = navigateToPage(
                videos[1].id,
                {
                    videoSource: VideoSource.Recommended,
                    initialVideoIndex: 1,
                }
            );
            await waitForDataToLoad();

            validateCurrentPlayer(videos, 1);
        });

        it("should start with first slide if initialVideoIndex is not set", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, validateCurrentPlayer } = navigateToPage(
                videos[1].id,
                {
                    videoSource: VideoSource.Recommended,
                    initialVideoIndex: undefined,
                }
            );
            await waitForDataToLoad();

            validateCurrentPlayer(videos, 0);
        });

        it("should render navigation buttons", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, getPreviousButton, getNextButton } =
                navigateToPage(videos[1].id, {
                    videoSource: VideoSource.Recommended,
                    initialVideoIndex: 1,
                });
            await waitForDataToLoad();

            expect(getPreviousButton()).toBeInTheDocument();
            expect(getNextButton()).toBeInTheDocument();
        });

        it("should not render the previous button when on first slide", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, getPreviousButton, getNextButton } =
                navigateToPage(videos[0].id, {
                    videoSource: VideoSource.Recommended,
                    initialVideoIndex: 0,
                });
            await waitForDataToLoad();

            expect(getPreviousButton()).not.toBeInTheDocument();
            expect(getNextButton()).toBeInTheDocument();
        });

        it("should not render the next button when on last slide", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const { waitForDataToLoad, getPreviousButton, getNextButton } =
                navigateToPage(videos[2].id, {
                    videoSource: VideoSource.Recommended,
                    initialVideoIndex: 2,
                });
            await waitForDataToLoad();

            expect(getPreviousButton()).toBeInTheDocument();
            expect(getNextButton()).not.toBeInTheDocument();
        });

        it("should switch to next slide when the next button is clicked", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const {
                waitForDataToLoad,
                getNextButton,
                validateCurrentPlayer,
                user,
            } = navigateToPage(videos[0].id);
            await waitForDataToLoad();
            validateCurrentPlayer(videos, 0);

            await user.click(getNextButton()!);

            validateCurrentPlayer(videos, 1);
        });

        it("should switch to previous slide when the previous button is clicked", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const {
                waitForDataToLoad,
                goToNext,
                getPreviousButton,
                validateCurrentPlayer,
                user,
            } = navigateToPage(videos[0].id);
            await waitForDataToLoad();
            await goToNext();
            validateCurrentPlayer(videos, 1);

            await user.click(getPreviousButton()!);

            validateCurrentPlayer(videos, 0);
        });

        it.each([{ key: "ArrowDown" }, { key: "PageDown" }])(
            "should switch to next slide when $key key is pressed",
            async ({ key }) => {
                const videos = createVideos(3, {});
                setRecommendedVideos(videos);
                const { waitForDataToLoad, validateCurrentPlayer, user } =
                    navigateToPage(videos[0].id);
                await waitForDataToLoad();
                validateCurrentPlayer(videos, 0);

                await user.keyboard(`{${key}}`);

                validateCurrentPlayer(videos, 1);
            }
        );

        it.each([{ key: "ArrowUp" }, { key: "PageUp" }])(
            "should switch to previous slide when $key key is pressed",
            async ({ key }) => {
                const videos = createVideos(3, {});
                setRecommendedVideos(videos);
                const {
                    waitForDataToLoad,
                    goToNext,
                    validateCurrentPlayer,
                    user,
                } = navigateToPage(videos[0].id);
                await waitForDataToLoad();
                await goToNext();
                validateCurrentPlayer(videos, 1);

                await user.keyboard(`{${key}}`);

                validateCurrentPlayer(videos, 0);
            }
        );

        it("should switch to next/previous slide on mouse wheel", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const {
                waitForDataToLoad,
                validateCurrentPlayer,
                getSlidesContainer,
            } = navigateToPage(videos[0].id);
            await waitForDataToLoad();
            const container = getSlidesContainer()!;
            validateCurrentPlayer(videos, 0);

            fireEvent.wheel(container, { deltaY: 10 });
            validateCurrentPlayer(videos, 1);

            await sleep(100);

            fireEvent.wheel(container, { deltaY: -10 });
            validateCurrentPlayer(videos, 0);
        });

        it("should switch to next/previous slide on swipe", async () => {
            simulateTouchDevice();
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const {
                waitForDataToLoad,
                validateCurrentPlayer,
                getSlidesContainer,
            } = navigateToPage(videos[0].id);
            await waitForDataToLoad();
            const container = getSlidesContainer()!;
            validateCurrentPlayer(videos, 0);

            await simulateSwipe(container, "up");
            validateCurrentPlayer(videos, 1);

            await simulateSwipe(container, "down");
            validateCurrentPlayer(videos, 0);
        });

        it("should update transform translate and URL when switching slides", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const {
                waitForDataToLoad,
                goToNext,
                getSlidesContainer,
                getLocation,
            } = navigateToPage(videos[0].id);
            await waitForDataToLoad();
            expect(getLocation().pathname).toBe(`/videos/${videos[0].id}`);
            expect(getSlidesContainer()).toHaveStyle(
                `transform: translate(0px,0px);`
            );

            await goToNext();
            expect(getLocation().pathname).toBe(`/videos/${videos[1].id}`);
            expect(getSlidesContainer()).toHaveStyle(
                `transform: translate(0px,${0 - PLAYER_HEIGHT}px);`
            );

            await goToNext();
            expect(getLocation().pathname).toBe(`/videos/${videos[2].id}`);
            expect(getSlidesContainer()).toHaveStyle(
                `transform: translate(0px,${0 - 2 * PLAYER_HEIGHT}px);`
            );
        });

        it("should close comments when switching slides", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const {
                waitForDataToLoad,
                getPlayers,
                getPlayerComponents,
                goToNext,
                user,
            } = navigateToPage(videos[0].id);
            await waitForDataToLoad();
            const firstPlayer = getPlayers()[0];
            await user.click(getPlayerComponents(firstPlayer).commentsButton!);
            expect(
                getPlayerComponents(firstPlayer).getComments()
            ).toBeInTheDocument();

            await goToNext();

            expect(
                getPlayerComponents(firstPlayer).getComments()
            ).not.toBeInTheDocument();
        });

        it("should close description when switching slides", async () => {
            const videos = createVideos(3, {});
            setRecommendedVideos(videos);
            const {
                waitForDataToLoad,
                getPlayers,
                getPlayerComponents,
                goToNext,
                user,
            } = navigateToPage(videos[0].id);
            await waitForDataToLoad();
            const firstPlayer = getPlayers()[0];
            await user.click(
                getPlayerComponents(firstPlayer).moreActionsButton!
            );
            await user.click(
                screen.getByRole("menuitem", { name: /description/i })
            );
            expect(
                getPlayerComponents(firstPlayer).getDescription()
            ).toBeInTheDocument();

            await goToNext();

            expect(
                getPlayerComponents(firstPlayer).getDescription()
            ).not.toBeInTheDocument();
        });
    });

    describe("fetching videos", () => {
        it.each<{
            source: VideoSource;
            arrange: () => { videos: Video[]; query?: BaseQuery };
        }>([
            {
                source: VideoSource.Videos,
                arrange: () => {
                    const profile = createProfile({});
                    const videos = createVideos(3, { profile });
                    return {
                        videos,
                        query: { profileId: profile.id } as BaseQuery,
                    };
                },
            },
            {
                source: VideoSource.Recommended,
                arrange: () => {
                    const videos = createVideos(3, {});
                    setRecommendedVideos(videos);
                    return { videos };
                },
            },
            {
                source: VideoSource.Popular,
                arrange: () => {
                    const videos = createVideos(3, {});
                    setPopularVideos(videos);
                    return { videos };
                },
            },
            {
                source: VideoSource.Latest,
                arrange: () => {
                    const videos = createVideos(3, {});
                    setLatestVideos(videos);
                    return { videos };
                },
            },
            {
                source: VideoSource.Search,
                arrange: () => {
                    const videos = createVideos(3, { title: "test" });
                    return {
                        videos,
                        query: { searchQuery: "test" } as BaseQuery,
                    };
                },
            },
            {
                source: VideoSource.SavedVideos,
                arrange: () => {
                    const videos = createVideos(3, {});
                    videos.forEach((video) =>
                        db.savedVideo.create({
                            profile: getOwnProfile().id,
                            video,
                        })
                    );
                    return { videos };
                },
            },
            {
                source: VideoSource.Following,
                arrange: () => {
                    const videos = createVideos(3, {});
                    setFollowingVideos(videos);
                    return { videos };
                },
            },
            {
                source: VideoSource.Likes,
                arrange: () => {
                    const videos = createVideos(3, {});
                    videos.forEach((video) =>
                        db.like.create({
                            profile: getOwnProfile(),
                            video,
                        })
                    );
                    return { videos };
                },
            },
        ])(
            "should fetch videos from $source if videoSource is set to $source",
            async ({ source, arrange }) => {
                createVideos(3, {}); // other videos
                const { videos, query } = arrange();
                const { waitForDataToLoad, getPlayers } = navigateToPage(
                    videos[0].id,
                    { videoSource: source, query, initialVideoIndex: 0 }
                );
                await waitForDataToLoad();

                const players = getPlayers();
                expect(players.length).toBe(videos.length);
                videos.forEach((video, index) =>
                    expect(players[index]).toHaveTextContent(video.title)
                );
            }
        );

        it("should fetch video from URL and recommended videos if videoSource is not provided", async () => {
            const video = createVideo({});
            const recommendedVideos = createVideos(3, {});
            setRecommendedVideos(recommendedVideos);
            const { waitForDataToLoad, getPlayers } = navigateToPage(video.id, {
                videoSource: undefined,
            });
            await waitForDataToLoad();

            const players = getPlayers();
            expect(players.length).toBe(recommendedVideos.length + 1);
            [video, ...recommendedVideos].forEach((video, index) =>
                expect(players[index]).toHaveTextContent(video.title)
            );
        });

        it("should fetch more videos when 2nd slide from end is reached", async () => {
            const slidesFromEnd = 2;
            const videos = createVideos(VIDEO_SEQUENCE_PAGE_SIZE * 2, {});
            setRecommendedVideos(videos);
            const initialVideoIndex =
                VIDEO_SEQUENCE_PAGE_SIZE - slidesFromEnd - 1;
            const { waitForDataToLoad, goToNext, getPlayers } = navigateToPage(
                videos[initialVideoIndex].id,
                { videoSource: VideoSource.Recommended, initialVideoIndex }
            );
            await waitForDataToLoad();
            let players = getPlayers();
            expect(players.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE);
            players.forEach((player, index) =>
                expect(player).toHaveTextContent(videos[index].title)
            );

            await goToNext();
            players = getPlayers();
            expect(players.length).toBe(VIDEO_SEQUENCE_PAGE_SIZE * 2);
            players.forEach((player, index) =>
                expect(player).toHaveTextContent(videos[index].title)
            );
        });
    });

    describe("highlighted comment", () => {
        it("should show highlighted comment if highlightedCommentId is set", async () => {
            const comment = createComment({ video });
            const { waitForDataToLoad, getPlayers, getPlayerComponents } =
                navigateToPage(video.id, {
                    highlightedCommentId: comment.id,
                });
            await waitForDataToLoad();

            const player = getPlayers()[0];
            const highlightedComment =
                getPlayerComponents(player).getHighlightedComment();
            expect(highlightedComment).toBeInTheDocument();
            expect(highlightedComment).toHaveTextContent(comment.text);
        });

        it("should show highlighted reply if highlightedCommentId and highlightedCommentParentId are set", async () => {
            const comment = createComment({ video });
            const reply = createComment({ video, parent: comment });
            const { waitForDataToLoad, getPlayers, getPlayerComponents } =
                navigateToPage(video.id, {
                    highlightedCommentId: reply.id,
                    highlightedCommentParentId: comment.id,
                });
            await waitForDataToLoad();

            const player = getPlayers()[0];
            const highlightedReply =
                getPlayerComponents(player).getHighlightedReply();
            expect(highlightedReply).toBeInTheDocument();
            expect(highlightedReply).toHaveTextContent(reply.text);
        });
    });

    interface LocationState {
        videoSource?: VideoSource;
        query?: BaseQuery;
        initialVideoIndex?: number;
        highlightedCommentId?: number;
        highlightedCommentParentId?: number;
    }

    function navigateToPage(videoId: number, locationState?: LocationState) {
        const defaultLocationState: LocationState = {
            videoSource: VideoSource.Recommended,
            query: {
                pagination: {
                    type: "cursor",
                    pageSize: VIDEO_SEQUENCE_PAGE_SIZE,
                },
            },
            initialVideoIndex: 0,
        };

        mockPlayersOffsetTop();

        const { getLocation } = navigateTo(`/videos/${videoId}`, {
            state: locationState ?? defaultLocationState,
        });

        const getSpinner = () => screen.queryByRole("progressbar");
        const waitForDataToLoad = () =>
            waitForElementToBeRemoved(getSpinner, { timeout: 3000 });

        const getSlidesContainer = () =>
            screen.queryByTestId("slides-container");

        const getPlayers = () => screen.queryAllByTestId("player");
        const getPlayerComponents = (player: HTMLElement) => {
            const video = within(player).queryByTestId("video");
            return {
                video: video ? (video as HTMLVideoElement) : video,
                getUnmuteButton: () =>
                    within(player).queryByRole("button", { name: "Unmute" }),
                getMuteButton: () =>
                    within(player).queryByRole("button", { name: "Mute" }),
                likeButton: within(player).queryAllByRole("button", {
                    name: /like/i,
                })[0],
                commentsButton: within(player).queryByRole("button", {
                    name: /comments/i,
                }),
                moreActionsButton: within(player).queryByRole("button", {
                    name: /more actions/i,
                }),
                authorAvatar: within(player).queryAllByRole("img", {
                    name: /avatar/i,
                })[0],
                authorUsername: within(player).queryByRole("heading", {
                    name: /username/i,
                }),
                videoTitle: within(player).queryAllByLabelText(/title/i)[0],
                getComments: () => within(player).queryByTestId("comments"),
                getDescription: () =>
                    within(player).queryByTestId("description"),
                getHighlightedComment: () =>
                    within(player).queryByRole("listitem", {
                        name: /highlighted comment/i,
                    }),
                getHighlightedReply: () =>
                    within(player).queryByRole("listitem", {
                        name: /highlighted reply/i,
                    }),
            };
        };

        const getHighlightedComment = () =>
            screen.queryByRole("listitem", { name: /highlighted comment/i });
        const getHighlightedReply = () =>
            screen.queryByRole("listitem", { name: /highlighted reply/i });

        const getPreviousButton = () =>
            screen.queryByRole("button", { name: /previous/i });
        const getNextButton = () =>
            screen.queryByRole("button", { name: /next/i });

        const validateCurrentPlayer = (
            videos: Video[],
            currentIndex: number
        ) => {
            const videoId = videos[currentIndex].id;
            expect(getLocation().pathname).toBe(`/videos/${videoId}`);
            expect(getSlidesContainer()).toHaveStyle(
                `transform: translate(0px,${
                    0 - currentIndex * PLAYER_HEIGHT
                }px);`
            );
        };

        const user = userEvent.setup();

        const goToNext = () => user.click(getNextButton()!);

        return {
            getLocation,
            getSpinner,
            waitForDataToLoad,
            getSlidesContainer,
            getPlayers,
            getPlayerComponents,
            getHighlightedComment,
            getHighlightedReply,
            getPreviousButton,
            getNextButton,
            validateCurrentPlayer,
            goToNext,
            user,
        };
    }
});

function mockPlayersOffsetTop() {
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(
        function (this: HTMLElement) {
            if (this.dataset.testid === "player") {
                const siblings = Array.from(this.parentElement!.children);
                const index = siblings.indexOf(this);
                return index * PLAYER_HEIGHT;
            }

            return 0;
        }
    );
}
