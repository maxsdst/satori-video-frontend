/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    screen,
    waitFor,
    waitForElementToBeRemoved,
    within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Player from "../../../src/components/Player";
import Comment from "../../../src/entities/Comment";
import Profile from "../../../src/entities/Profile";
import Video from "../../../src/entities/Video";
import { db } from "../../mocks/db";
import {
    countEvents,
    isVideoLiked,
    isVideoSaved,
    renderWithRouter,
    simulateUnauthenticated,
} from "../../utils";

describe("Player", () => {
    let video: Video;
    let comment: Comment;
    let reply: Comment;

    beforeEach(() => {
        const user = db.user.create();
        const profile = db.profile.create({ user }) as Profile;
        video = db.video.create({ profile }) as Video;
        comment = db.comment.create({ profile, video: video.id }) as Comment;
        reply = db.comment.create({
            profile,
            video: video.id,
            parent: comment.id,
        }) as Comment;
    });

    describe("loading skeleton", () => {
        it("should show loading skeleton while loading", () => {
            const { getSkeleton } = renderComponent({ videoId: video.id });

            expect(getSkeleton()).toBeInTheDocument();
        });

        it("should hide loading skeleton after loading is complete", async () => {
            const { getSkeleton } = renderComponent({ videoId: video.id });

            await waitForElementToBeRemoved(getSkeleton);
        });
    });

    describe("initial state", () => {
        it("should render preview", async () => {
            const { getSkeleton } = renderComponent({
                videoId: video.id,
            });
            await waitForElementToBeRemoved(getSkeleton);

            expect(screen.getByTestId("player-wrapper")).toHaveStyle({
                "background-image": `url("${video.first_frame}")`,
            });
        });

        it("should render video correctly", async () => {
            const { getSkeleton, getVideo } = renderComponent({
                videoId: video.id,
            });
            await waitForElementToBeRemoved(getSkeleton);

            const videoElement = getVideo();
            expect(videoElement).toBeInTheDocument();
            expect(videoElement).toHaveAttribute("src", video.source);
            expect(videoElement).toHaveAttribute("preload", "auto");
            expect(videoElement).toHaveAttribute("playsinline");
            expect(videoElement).toHaveAttribute("loop");
            expect(videoElement).toHaveAttribute("autoplay");
        });

        it("should not render video when isPlaying prop is set to false", async () => {
            const { getSkeleton, getVideo } = renderComponent({
                videoId: video.id,
                isPlaying: false,
            });
            await waitForElementToBeRemoved(getSkeleton);

            expect(getVideo()).not.toBeInTheDocument();
        });

        it("should unmute video when isMuted prop is set to false", async () => {
            const { getSkeleton, getVideo, getMuteButton, getUnmuteButton } =
                renderComponent({
                    videoId: video.id,
                    isMuted: false,
                });
            await waitForElementToBeRemoved(getSkeleton);

            expect(getMuteButton()).toBeInTheDocument();
            expect(getUnmuteButton()).not.toBeInTheDocument();
            expect(getVideo()?.muted).toBe(false);
        });

        it("should mute video when isMuted prop is set to true", async () => {
            const { getSkeleton, getVideo, getMuteButton, getUnmuteButton } =
                renderComponent({
                    videoId: video.id,
                    isMuted: true,
                });
            await waitForElementToBeRemoved(getSkeleton);

            expect(getUnmuteButton()).toBeInTheDocument();
            expect(getMuteButton()).not.toBeInTheDocument();
            expect(getVideo()?.muted).toBe(true);
        });
    });

    describe("interaction buttons", () => {
        it("should not render interaction buttons when showInteractionButtons is set to false", async () => {
            const {
                getSkeleton,
                getLikeButton,
                getCommentsButton,
                getMoreActionsButton,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: false,
            });
            await waitForElementToBeRemoved(getSkeleton);

            expect(getLikeButton()).not.toBeInTheDocument();
            expect(getCommentsButton()).not.toBeInTheDocument();
            expect(getMoreActionsButton()).not.toBeInTheDocument();
        });

        it("should render interaction buttons when showInteractionButtons is set to true", async () => {
            const {
                getSkeleton,
                getLikeButton,
                getCommentsButton,
                getMoreActionsButton,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await waitFor(getLikeButton);

            const likeButton = getLikeButton();
            expect(likeButton).toBeInTheDocument();
            expect(likeButton).toHaveTextContent(video.like_count.toString());
            const commentsButton = getCommentsButton();
            expect(commentsButton).toBeInTheDocument();
            expect(commentsButton).toHaveTextContent(
                video.comment_count.toString()
            );
            expect(getMoreActionsButton()).toBeInTheDocument();
        });
    });

    describe("video info", () => {
        it("should not render video info when showVideoInfo is set to false", async () => {
            const {
                getSkeleton,
                getAuthorAvatar,
                getAuthorUsername,
                getVideoTitle,
            } = renderComponent({
                videoId: video.id,
                showVideoInfo: false,
            });
            await waitForElementToBeRemoved(getSkeleton);

            expect(getAuthorAvatar()).not.toBeInTheDocument();
            expect(getAuthorUsername()).not.toBeInTheDocument();
            expect(getVideoTitle()).not.toBeInTheDocument();
        });

        it("should render video info when showVideoInfo is set to true", async () => {
            const {
                getSkeleton,
                getAuthorAvatar,
                getAuthorUsername,
                getVideoTitle,
            } = renderComponent({
                videoId: video.id,
                showVideoInfo: true,
            });
            await waitForElementToBeRemoved(getSkeleton);

            const authorAvatar = getAuthorAvatar();
            expect(authorAvatar).toBeInTheDocument();
            expect(authorAvatar).toHaveAttribute("src", video.profile.avatar);
            const authorUsername = getAuthorUsername();
            expect(authorUsername).toBeInTheDocument();
            expect(authorUsername).toHaveTextContent(
                video.profile.user.username
            );
            const videoTitle = getVideoTitle();
            expect(videoTitle).toBeInTheDocument();
            expect(videoTitle).toHaveTextContent(video.title);
        });

        it("should redirect to author's profile page when username is clicked", async () => {
            const { getSkeleton, getAuthorUsername, user, getLocation } =
                renderComponent({
                    videoId: video.id,
                    showVideoInfo: true,
                });
            await waitForElementToBeRemoved(getSkeleton);

            await user.click(getAuthorUsername()!);

            expect(getLocation().pathname).toBe(
                `/users/${video.profile.user.username}`
            );
        });

        it("should redirect to author's profile page when avatar is clicked", async () => {
            const { getSkeleton, getAuthorAvatar, user, getLocation } =
                renderComponent({
                    videoId: video.id,
                    showVideoInfo: true,
                });
            await waitForElementToBeRemoved(getSkeleton);

            await user.click(getAuthorAvatar()!);

            expect(getLocation().pathname).toBe(
                `/users/${video.profile.user.username}`
            );
        });
    });

    describe("playback", () => {
        it(
            "should call onProgress periodically while video is playing",
            async () => {
                const { getSkeleton, getVideo, onProgress } = renderComponent({
                    videoId: video.id,
                    isPlaying: true,
                });
                await waitForElementToBeRemoved(getSkeleton);
                const videoElement = getVideo()!;
                let lastTimesCalled = onProgress.mock.calls.length;
                let lastSecondsPlayed: number;
                await waitFor(() =>
                    expect(videoElement.currentTime).toBeGreaterThan(0)
                );
                const duration = videoElement.duration;

                await waitFor(() => {
                    const timesCalled = onProgress.mock.calls.length;
                    expect(timesCalled).toBeGreaterThan(lastTimesCalled);
                    const [secondsPlayed, percentPlayed] =
                        onProgress.mock.lastCall;
                    expect(secondsPlayed / (percentPlayed / 100)).approximately(
                        duration,
                        0.1
                    );
                    lastTimesCalled = timesCalled;
                    lastSecondsPlayed = secondsPlayed;
                });
                await waitFor(() => {
                    const timesCalled = onProgress.mock.calls.length;
                    expect(timesCalled).toBeGreaterThan(lastTimesCalled);
                    const [secondsPlayed, percentPlayed] =
                        onProgress.mock.lastCall;
                    expect(secondsPlayed / (percentPlayed / 100)).approximately(
                        duration,
                        0.1
                    );
                    expect(secondsPlayed).toBeGreaterThan(lastSecondsPlayed);
                    lastTimesCalled = timesCalled;
                    lastSecondsPlayed = secondsPlayed;
                });
                await waitFor(() => {
                    const timesCalled = onProgress.mock.calls.length;
                    expect(timesCalled).toBeGreaterThan(lastTimesCalled);
                    const [secondsPlayed, percentPlayed] =
                        onProgress.mock.lastCall;
                    expect(secondsPlayed / (percentPlayed / 100)).approximately(
                        duration,
                        0.1
                    );
                    expect(secondsPlayed).toBeGreaterThan(lastSecondsPlayed);
                });
            },
            { timeout: 10000 }
        );

        it("should play/pause the video when the trigger is clicked", async () => {
            const { getSkeleton, getVideo, getPlayPauseTrigger, user } =
                renderComponent({
                    videoId: video.id,
                    isPlaying: true,
                });
            await waitForElementToBeRemoved(getSkeleton);
            const videoElement = getVideo()!;
            const trigger = getPlayPauseTrigger()!;
            await user.click(trigger);
            const play = vi.spyOn(videoElement, "play");
            const pause = vi.spyOn(videoElement, "pause");
            expect(videoElement.paused).toBe(true);

            await user.click(trigger);
            expect(play).toHaveBeenCalled();
            expect(videoElement.paused).toBe(false);

            await user.click(trigger);
            expect(pause).toHaveBeenCalled();
            expect(videoElement.paused).toBe(true);
        });
    });

    describe("mute button", () => {
        it("should mute/unmute the video when the button is clicked", async () => {
            const {
                getSkeleton,
                getVideo,
                getMuteButton,
                getUnmuteButton,
                user,
            } = renderComponent({
                videoId: video.id,
                isMuted: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            const videoElement = getVideo()!;
            expect(videoElement.muted).toBe(true);

            await user.click(getUnmuteButton()!);
            expect(videoElement.muted).toBe(false);
            expect(getUnmuteButton()).not.toBeInTheDocument();
            expect(getMuteButton()).toBeInTheDocument();

            await user.click(getMuteButton()!);
            expect(videoElement.muted).toBe(true);
            expect(getMuteButton()).not.toBeInTheDocument();
            expect(getUnmuteButton()).toBeInTheDocument();
        });

        it("should call onMuteStateChange with correct value when the button is clicked", async () => {
            const {
                getSkeleton,
                getMuteButton,
                getUnmuteButton,
                onMuteStateChange,
                user,
            } = renderComponent({
                videoId: video.id,
                isMuted: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            expect(onMuteStateChange).not.toBeCalled();

            await user.click(getUnmuteButton()!);
            expect(onMuteStateChange).toBeCalledWith(false);

            await user.click(getMuteButton()!);
            expect(onMuteStateChange).toBeCalledWith(true);
        });
    });

    describe("like button", () => {
        it("should create/remove like when the button is clicked", async () => {
            const { getSkeleton, getLikeButton, getRemoveLikeButton, user } =
                renderComponent({
                    videoId: video.id,
                    showInteractionButtons: true,
                });
            await waitForElementToBeRemoved(getSkeleton);
            expect(isVideoLiked(video.id)).toBe(false);

            await user.click(getLikeButton()!);
            expect(isVideoLiked(video.id)).toBe(true);
            expect(getLikeButton()).not.toBeInTheDocument();
            expect(getRemoveLikeButton()).toBeInTheDocument();

            await user.click(getRemoveLikeButton()!);
            expect(isVideoLiked(video.id)).toBe(false);
            expect(getRemoveLikeButton()).not.toBeInTheDocument();
            expect(getLikeButton()).toBeInTheDocument();
        });

        it("should create event when the button is clicked", async () => {
            const { getSkeleton, getLikeButton, user } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            expect(countEvents(video.id, "like")).toBe(0);

            await user.click(getLikeButton()!);

            expect(countEvents(video.id, "like")).toBe(1);
        });

        it("should show login request modal when the button is clicked if user is not authenticated", async () => {
            simulateUnauthenticated();
            const { getSkeleton, getLikeButton, getLoginRequestModal, user } =
                renderComponent({
                    videoId: video.id,
                    showInteractionButtons: true,
                });
            await waitForElementToBeRemoved(getSkeleton);
            expect(getLoginRequestModal()).not.toBeInTheDocument();

            await user.click(getLikeButton()!);

            expect(getLoginRequestModal()).toBeInTheDocument();
        });
    });

    describe("comments button", () => {
        it("should open comments when the button is clicked", async () => {
            const { getSkeleton, getCommentsButton, getComments, user } =
                renderComponent({
                    videoId: video.id,
                    showInteractionButtons: true,
                });
            await waitForElementToBeRemoved(getSkeleton);
            expect(getComments()).not.toBeInTheDocument();

            await user.click(getCommentsButton()!);

            expect(getComments()).toBeInTheDocument();
        });
    });

    describe("more actions menu", () => {
        it("should show the menu when the more actions button is clicked", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getMoreActionsMenu,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            expect(getMoreActionsMenu().menu).not.toBeInTheDocument();

            await user.click(getMoreActionsButton()!);

            expect(getMoreActionsMenu().menu).toBeInTheDocument();
        });

        it("should render the menu correctly", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getMoreActionsMenu,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);

            const menu = getMoreActionsMenu().menu;
            const items = screen.getAllByRole("menuitem");
            items.forEach((item) => expect(menu).toContainElement(item));
            [/description/i, /share/i, /save/i, /report/i].forEach(
                (text, index) => expect(items[index]).toHaveTextContent(text)
            );
        });

        it("should show description when the description item is clicked", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getDescription,
                getMoreActionsMenu,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);
            expect(getDescription()).not.toBeInTheDocument();

            await user.click(getMoreActionsMenu().descriptionItem!);

            expect(getDescription()).toBeInTheDocument();
        });

        it("should show share modal when the share item is clicked", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getMoreActionsMenu,
                getShareModal,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);
            expect(getShareModal()).not.toBeInTheDocument();

            await user.click(getMoreActionsMenu().shareItem!);

            expect(getShareModal()).toBeInTheDocument();
        });

        it("should create event when the share item is clicked", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getMoreActionsMenu,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);
            expect(countEvents(video.id, "share")).toBe(0);

            await user.click(getMoreActionsMenu().shareItem!);

            expect(countEvents(video.id, "share")).toBe(1);
        });

        it("should save or remove video from saved when the save item is clicked", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getMoreActionsMenu,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);
            const saveItem = getMoreActionsMenu().saveItem!;
            expect(saveItem).toHaveTextContent("Save");
            expect(isVideoSaved(video.id)).toBe(false);

            await user.click(saveItem);
            expect(saveItem).toHaveTextContent("Saved");
            expect(isVideoSaved(video.id)).toBe(true);

            await user.click(saveItem);
            expect(saveItem).toHaveTextContent("Save");
            expect(isVideoSaved(video.id)).toBe(false);
        });

        it("should show report modal when the report item is clicked", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getMoreActionsMenu,
                getReportModal,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);
            expect(getReportModal()).not.toBeInTheDocument();

            await user.click(getMoreActionsMenu().reportItem!);

            expect(getReportModal()).toBeInTheDocument();
        });
    });

    describe("comments", () => {
        it("should call onContentExpanded when comments are opened", async () => {
            const {
                getSkeleton,
                getCommentsButton,
                getComments,
                onContentExpanded,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            expect(getComments()).not.toBeInTheDocument();
            expect(onContentExpanded).not.toBeCalled();

            await user.click(getCommentsButton()!);

            expect(onContentExpanded).toBeCalled();
        });

        it("should close comments when the close button is clicked", async () => {
            const {
                getSkeleton,
                getCommentsButton,
                getComments,
                getCommentsCloseButton,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getCommentsButton()!);
            expect(getComments()).toBeInTheDocument();

            await user.click(getCommentsCloseButton()!);

            expect(getComments()).not.toBeInTheDocument();
        });

        it("should call onContentCollapsed when comments are closed", async () => {
            const {
                getSkeleton,
                getCommentsButton,
                getComments,
                getCommentsCloseButton,
                onContentCollapsed,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getCommentsButton()!);
            expect(getComments()).toBeInTheDocument();
            expect(onContentCollapsed).not.toBeCalled();

            await user.click(getCommentsCloseButton()!);

            expect(onContentCollapsed).toBeCalled();
        });

        it("should close description when comments are opened", async () => {
            const {
                getSkeleton,
                getCommentsButton,
                getComments,
                getMoreActionsButton,
                getMoreActionsMenu,
                getDescription,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);
            await user.click(getMoreActionsMenu().descriptionItem!);
            expect(getDescription()).toBeInTheDocument();

            await user.click(getCommentsButton()!);

            expect(getComments()).toBeInTheDocument();
            expect(getDescription()).not.toBeInTheDocument();
        });
    });

    describe("description", () => {
        it("should call onContentExpanded when description is opened", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getMoreActionsMenu,
                getDescription,
                onContentExpanded,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);
            expect(getDescription()).not.toBeInTheDocument();
            expect(onContentExpanded).not.toBeCalled();

            await user.click(getMoreActionsMenu().descriptionItem!);

            expect(onContentExpanded).toBeCalled();
        });

        it("should close description when the close button is clicked", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getMoreActionsMenu,
                getDescription,
                getDescriptionCloseButton,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);
            await user.click(getMoreActionsMenu().descriptionItem!);
            expect(getDescription()).toBeInTheDocument();

            await user.click(getDescriptionCloseButton()!);

            expect(getDescription()).not.toBeInTheDocument();
        });

        it("should call onContentCollapsed when description is closed", async () => {
            const {
                getSkeleton,
                getMoreActionsButton,
                getMoreActionsMenu,
                getDescription,
                getDescriptionCloseButton,
                onContentCollapsed,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getMoreActionsButton()!);
            await user.click(getMoreActionsMenu().descriptionItem!);
            expect(getDescription()).toBeInTheDocument();
            expect(onContentCollapsed).not.toBeCalled();

            await user.click(getDescriptionCloseButton()!);

            expect(onContentCollapsed).toBeCalled();
        });

        it("should close comments when description is opened", async () => {
            const {
                getSkeleton,
                getCommentsButton,
                getComments,
                getMoreActionsButton,
                getMoreActionsMenu,
                getDescription,
                user,
            } = renderComponent({
                videoId: video.id,
                showInteractionButtons: true,
            });
            await waitForElementToBeRemoved(getSkeleton);
            await user.click(getCommentsButton()!);
            expect(getComments()).toBeInTheDocument();

            await user.click(getMoreActionsButton()!);
            await user.click(getMoreActionsMenu().descriptionItem!);

            expect(getDescription()).toBeInTheDocument();
            expect(getComments()).not.toBeInTheDocument();
        });
    });

    describe("highlighted comment", () => {
        it("should show highlighted comment if highlightedCommentId prop is passed", async () => {
            const { getSkeleton, getComments, getHighlightedComment } =
                renderComponent({
                    videoId: video.id,
                    highlightedCommentId: comment.id,
                });
            await waitForElementToBeRemoved(getSkeleton);

            const comments = getComments();
            const highlightedComment = getHighlightedComment();
            expect(comments).toBeInTheDocument();
            expect(highlightedComment).toBeInTheDocument();
            expect(highlightedComment).toHaveTextContent(comment.text);
            expect(comments).toContainElement(highlightedComment);
        });

        it("should show highlighted reply if highlightedCommentId and highlightedCommentParentId props are passed", async () => {
            const { getSkeleton, getComments, getHighlightedReply } =
                renderComponent({
                    videoId: video.id,
                    highlightedCommentId: reply.id,
                    highlightedCommentParentId: comment.id,
                });
            await waitForElementToBeRemoved(getSkeleton);

            const comments = getComments();
            const highlightedReplyParent = screen.getByText(comment.text);
            const highlightedReply = getHighlightedReply();
            expect(comments).toBeInTheDocument();
            expect(highlightedReplyParent).toBeInTheDocument();
            expect(highlightedReply).toBeInTheDocument();
            expect(highlightedReply).toHaveTextContent(reply.text);
            expect(comments).toContainElement(highlightedReply);
        });
    });
});

interface Props {
    videoId: number;
    showInteractionButtons?: boolean;
    showVideoInfo?: boolean;
    isPlaying?: boolean;
    isMuted?: boolean;
    isFullscreen?: boolean;
    highlightedCommentId?: number;
    highlightedCommentParentId?: number;
}

function renderComponent(props: Props) {
    const defaults = {
        showInteractionButtons: false,
        showVideoInfo: false,
        isPlaying: true,
        isMuted: true,
        isFullscreen: false,
    };

    const onMuteStateChange = vi.fn();
    const onProgress = vi.fn();
    const onContentExpanded = vi.fn();
    const onContentCollapsed = vi.fn();

    const { getLocation } = renderWithRouter(
        <Player
            onMuteStateChange={onMuteStateChange}
            onProgress={onProgress}
            onContentExpanded={onContentExpanded}
            onContentCollapsed={onContentCollapsed}
            {...{ ...defaults, ...props }}
            width="315px"
            height="560px"
            roundCorners={false}
        />
    );

    const getSkeleton = () =>
        screen.queryByRole("progressbar", { name: /video/i });
    const getVideo = () => {
        const video = screen.queryByTestId("video");
        return video ? (video as HTMLVideoElement) : video;
    };
    const getPlayPauseTrigger = () =>
        screen.queryByTestId("play-pause-trigger");

    const getMuteButton = () => screen.queryByRole("button", { name: "Mute" });
    const getUnmuteButton = () =>
        screen.queryByRole("button", { name: "Unmute" });

    const getLikeButton = () => screen.queryByRole("button", { name: "Like" });
    const getRemoveLikeButton = () =>
        screen.queryByRole("button", { name: "Remove like" });

    const getCommentsButton = () =>
        screen.queryByRole("button", { name: /comments/i });
    const getComments = () => screen.queryByTestId("comments");
    const getCommentsCloseButton = () =>
        within(getComments()!).queryByRole("button", { name: /close/i });
    const getHighlightedComment = () =>
        screen.queryByRole("listitem", { name: /highlighted comment/i });
    const getHighlightedReply = () =>
        screen.queryByRole("listitem", { name: /highlighted reply/i });

    const getMoreActionsButton = () =>
        screen.queryByRole("button", { name: /more actions/i });
    const getMoreActionsMenu = () => {
        const menu = screen.queryByRole("menu", { name: /more actions menu/i });
        return {
            menu,
            descriptionItem:
                menu &&
                within(menu).queryByRole("menuitem", { name: /description/i }),
            shareItem:
                menu &&
                within(menu).queryByRole("menuitem", { name: /share/i }),
            saveItem:
                menu && within(menu).queryByRole("menuitem", { name: /save/i }),
            reportItem:
                menu &&
                within(menu).queryByRole("menuitem", { name: /report/i }),
        };
    };

    const getDescription = () => screen.queryByTestId("description");
    const getDescriptionCloseButton = () =>
        within(getDescription()!).queryByRole("button", { name: /close/i });

    const getShareModal = () => screen.queryByTestId("share-modal");

    const getReportModal = () => screen.queryByTestId("report-modal");

    const getAuthorAvatar = () =>
        screen.queryByRole("img", { name: /avatar/i });
    const getAuthorUsername = () =>
        screen.queryByRole("heading", { name: /username/i });
    const getVideoTitle = () => screen.queryByLabelText(/title/i);

    const getLoginRequestModal = () =>
        screen.queryByTestId("login-request-modal");

    const user = userEvent.setup();

    return {
        getLocation,
        getSkeleton,
        getVideo,
        getPlayPauseTrigger,
        getMuteButton,
        getUnmuteButton,
        getLikeButton,
        getRemoveLikeButton,
        getCommentsButton,
        getComments,
        getCommentsCloseButton,
        getHighlightedComment,
        getHighlightedReply,
        getMoreActionsButton,
        getMoreActionsMenu,
        getDescription,
        getDescriptionCloseButton,
        getShareModal,
        getReportModal,
        getAuthorAvatar,
        getAuthorUsername,
        getVideoTitle,
        getLoginRequestModal,
        onMuteStateChange,
        onProgress,
        onContentExpanded,
        onContentCollapsed,
        user,
    };
}
