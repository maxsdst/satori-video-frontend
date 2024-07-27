/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { faker } from "@faker-js/faker";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Item from "../../../../src/components/Player/Comments/Item";
import Comment from "../../../../src/entities/Comment";
import { db, getOwnProfile } from "../../../mocks/db";
import { BASE_URL } from "../../../mocks/handlers/constants";
import {
    countComments,
    createComment,
    createComments,
    createProfile,
    isCommentLiked,
    renderWithRouter,
    simulateError,
    simulateTooLongText,
    sortComments,
} from "../../../utils";

describe("Item", () => {
    const COLLAPSED_TEXT_NO_OF_LINES = 4;
    const REPLIES_PAGE_SIZE = 10;

    let comment: Comment;

    const syncComment = () => {
        comment = db.comment.findFirst({
            where: { id: { equals: comment.id } },
        }) as Comment;
    };

    beforeEach(() => {
        comment = createComment({});
    });

    describe("author's avatar and username", () => {
        it("should render avatar and username", async () => {
            const { waitForDataToLoad, getAuthorAvatar, getAuthorUsername } =
                renderComponent({ comment });
            await waitForDataToLoad();

            const avatar = getAuthorAvatar();
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute("src", comment.profile.avatar);
            const username = getAuthorUsername();
            expect(username).toBeInTheDocument();
            expect(username).toHaveTextContent(comment.profile.user.username);
        });

        it("should redirect to the profile page when avatar is clicked", async () => {
            const { waitForDataToLoad, getAuthorAvatar, user, getLocation } =
                renderComponent({ comment });
            await waitForDataToLoad();

            await user.click(getAuthorAvatar()!);

            expect(getLocation().pathname).toBe(
                `/users/${comment.profile.user.username}`
            );
        });

        it("should redirect to the profile page when username is clicked", async () => {
            const { waitForDataToLoad, getAuthorUsername, user, getLocation } =
                renderComponent({ comment });
            await waitForDataToLoad();

            await user.click(getAuthorUsername()!);

            expect(getLocation().pathname).toBe(
                `/users/${comment.profile.user.username}`
            );
        });
    });

    describe("date", () => {
        it("should render date correctly", async () => {
            const comment = createComment({
                creationDate: new Date(2024, 0, 24, 1, 1, 0),
            });
            vi.setSystemTime(new Date(2024, 0, 24, 1, 1, 24));
            const { waitForDataToLoad, getDate } = renderComponent({ comment });
            await waitForDataToLoad();

            const date = getDate();
            expect(date).toBeInTheDocument();
            expect(date).toHaveTextContent(/24 seconds ago/i);
        });
    });

    describe("comment text", () => {
        describe("mentioned username", () => {
            it("should render the username if mentioned_profile_username is not null", async () => {
                const username = "user123";
                const mentionedProfile = createProfile({ username });
                const comment = createComment({ mentionedProfile });
                const { waitForDataToLoad, getMentionedUsername } =
                    renderComponent({ comment });
                await waitForDataToLoad();

                const mentionedUsername = getMentionedUsername();
                expect(mentionedUsername).toBeInTheDocument();
                expect(mentionedUsername).toHaveTextContent(`@${username}`);
            });

            it("should not render the username if mentioned_profile_username is null", async () => {
                const comment = createComment({});
                const { waitForDataToLoad, getMentionedUsername } =
                    renderComponent({ comment });
                await waitForDataToLoad();

                const mentionedUsername = getMentionedUsername();
                expect(mentionedUsername).not.toBeInTheDocument();
            });

            it("should redirect to the profile page on click if mentioned_profile is not null", async () => {
                const username = "user123";
                const mentionedProfile = createProfile({ username });
                const comment = createComment({ mentionedProfile });
                const {
                    waitForDataToLoad,
                    getMentionedUsername,
                    user,
                    getLocation,
                } = renderComponent({ comment });
                await waitForDataToLoad();

                await user.click(getMentionedUsername()!);

                expect(getLocation().pathname).toBe(`/users/${username}`);
            });

            it("should not redirect to the profile page on click if mentioned_profile is null", async () => {
                const comment = createComment({});
                const {
                    waitForDataToLoad,
                    getMentionedUsername,
                    user,
                    getLocation,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                const initialPathname = getLocation().pathname;

                await user.click(getMentionedUsername()!);

                expect(getLocation().pathname).toBe(initialPathname);
            });
        });

        describe("text", () => {
            it("should render correct text", async () => {
                const { waitForDataToLoad, getText } = renderComponent({
                    comment,
                });
                await waitForDataToLoad();

                const text = getText();
                expect(text).toBeInTheDocument();
                expect(text).toHaveTextContent(comment.text);
            });

            it("should render truncated text with show more button if text is too long", async () => {
                simulateTooLongText();
                const { waitForDataToLoad, getText, getShowMoreButton } =
                    renderComponent({ comment });
                await waitForDataToLoad();

                const text = getText();
                expect(text).toBeInTheDocument();
                expect(text).toHaveStyle(
                    `-webkit-line-clamp: ${COLLAPSED_TEXT_NO_OF_LINES}`
                );
                expect(getShowMoreButton()).toBeInTheDocument();
            });

            it("should not render the show more button if text is not too long", async () => {
                const { waitForDataToLoad, getShowMoreButton } =
                    renderComponent({ comment });
                await waitForDataToLoad();

                expect(getShowMoreButton()).not.toBeInTheDocument();
            });

            it("should expand/collapse the text", async () => {
                simulateTooLongText();
                const {
                    waitForDataToLoad,
                    getText,
                    getShowMoreButton,
                    getShowLessButton,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                const text = getText();
                expect(text).toHaveStyle(
                    `-webkit-line-clamp: ${COLLAPSED_TEXT_NO_OF_LINES}`
                );
                expect(getShowLessButton()).not.toBeInTheDocument();

                await user.click(getShowMoreButton()!);
                expect(text).not.toHaveStyle(
                    `-webkit-line-clamp: ${COLLAPSED_TEXT_NO_OF_LINES}`
                );
                expect(getShowLessButton()).toBeInTheDocument();
                expect(getShowMoreButton()).not.toBeInTheDocument();

                await user.click(getShowLessButton()!);
                expect(text).toHaveStyle(
                    `-webkit-line-clamp: ${COLLAPSED_TEXT_NO_OF_LINES}`
                );
                expect(getShowMoreButton()).toBeInTheDocument();
                expect(getShowLessButton()).not.toBeInTheDocument();
            });
        });
    });

    describe("like button", () => {
        it("should render the like button and the like count", async () => {
            const { waitForDataToLoad, getLikeButton, getLikeCount } =
                renderComponent({ comment });
            await waitForDataToLoad();

            expect(getLikeButton()).toBeInTheDocument();
            const likeCount = getLikeCount();
            expect(likeCount).toBeInTheDocument();
            expect(likeCount).toHaveTextContent(comment.like_count.toString());
        });

        it("should create/remove like when the button is clicked", async () => {
            const {
                waitForDataToLoad,
                getLikeButton,
                getRemoveLikeButton,
                user,
                rerender,
            } = renderComponent({ comment });
            await waitForDataToLoad();
            expect(isCommentLiked(comment.id)).toBe(false);

            await user.click(getLikeButton()!);
            expect(isCommentLiked(comment.id)).toBe(true);
            syncComment();
            rerender({ comment });
            await waitForDataToLoad();
            expect(getLikeButton()).not.toBeInTheDocument();
            expect(getRemoveLikeButton()).toBeInTheDocument();

            await user.click(getRemoveLikeButton()!);
            expect(isCommentLiked(comment.id)).toBe(false);
            syncComment();
            rerender({ comment });
            await waitForDataToLoad();
            expect(getRemoveLikeButton()).not.toBeInTheDocument();
            expect(getLikeButton()).toBeInTheDocument();
        });
    });

    describe("create reply form", () => {
        describe("reply button", () => {
            it("should render the reply button", async () => {
                const { waitForDataToLoad, getReplyButton } = renderComponent({
                    comment,
                });
                await waitForDataToLoad();

                expect(getReplyButton()).toBeInTheDocument();
            });

            it("should show the form when the reply button is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                expect(getCreateReplyForm().form).not.toBeInTheDocument();

                await user.click(getReplyButton()!);

                expect(getCreateReplyForm().form).toBeInTheDocument();
            });
        });

        describe("form", () => {
            it("should render the form correctly", async () => {
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);

                const { form, input, cancelButton, submitButton } =
                    getCreateReplyForm();
                const avatar = within(form).getByRole("img");
                expect(avatar).toBeInTheDocument();
                expect(avatar).toHaveAttribute("src", getOwnProfile().avatar);
                expect(input).toBeInTheDocument();
                expect(cancelButton).toBeInTheDocument();
                expect(submitButton).toBeInTheDocument();
                expect(submitButton).toHaveAttribute("disabled");
            });

            it("should render mentioned username if comment is a reply", async () => {
                const comment = createComment({ isReply: true });
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment, isReply: true });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);

                const { mentionedUsername } = getCreateReplyForm();
                expect(mentionedUsername).toBeInTheDocument();
                expect(mentionedUsername).toHaveTextContent(
                    `@${comment.profile.user.username}`
                );
            });

            it("should not render mentioned username if comment is not a reply", async () => {
                const comment = createComment({ isReply: false });
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment, isReply: false });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);

                const { mentionedUsername } = getCreateReplyForm();
                expect(mentionedUsername).not.toBeInTheDocument();
            });

            it("should enable submit button when input is filled", async () => {
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);
                const { input, submitButton } = getCreateReplyForm();
                expect(submitButton).toHaveAttribute("disabled");

                await user.type(input!, "a");

                expect(submitButton).not.toHaveAttribute("disabled");
            });

            it("should hide the form when the cancel button is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);
                const { form, cancelButton } = getCreateReplyForm();
                expect(form).toBeInTheDocument();

                await user.click(cancelButton!);

                expect(getCreateReplyForm().form).not.toBeInTheDocument();
            });

            it("should create reply when the form is submitted", async () => {
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);
                const text = "abc";

                const { input, submitButton } = getCreateReplyForm();
                await user.type(input!, text);
                expect(countComments({ parentId: comment.id })).toBe(0);
                await user.click(submitButton!);

                expect(countComments({ parentId: comment.id, text })).toBe(1);
                const reply = db.comment.findFirst({
                    where: {
                        parent: { equals: comment.id },
                        text: { equals: text },
                    },
                });
                expect(reply!.mentioned_profile).toBe(null);
            });

            it("should create reply with mentioned profile when the form is submitted if comment is a reply", async () => {
                const comment = createComment({ isReply: true });
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment, isReply: true });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);
                const text = "abc";

                const { input, submitButton } = getCreateReplyForm();
                await user.type(input!, text);
                expect(countComments({ parentId: comment.parent! })).toBe(1);
                await user.click(submitButton!);

                expect(countComments({ parentId: comment.parent! })).toBe(2);
                expect(
                    countComments({
                        parentId: comment.parent!,
                        mentionedProfile: comment.profile,
                        text,
                    })
                ).toBe(1);
            });

            it("should call onReplyToReplyCreated if reply creation succeeded and comment is a reply", async () => {
                const comment = createComment({ isReply: true });
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    onReplyToReplyCreated,
                    user,
                } = renderComponent({ comment, isReply: true });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);
                const text = "abc";

                const { input, submitButton } = getCreateReplyForm();
                await user.type(input!, text);
                await user.click(submitButton!);

                const reply = db.comment.findFirst({
                    where: {
                        parent: { equals: comment.parent! },
                        mentioned_profile: { equals: comment.profile.id },
                        text: { equals: text },
                    },
                });
                expect(onReplyToReplyCreated).toHaveBeenCalledTimes(1);
                expect(reply).not.toBe(null);
                expect(onReplyToReplyCreated.mock.lastCall[0].id).toBe(
                    reply!.id
                );
            });

            it("should hide the form if reply creation succeeded", async () => {
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);

                const { input, submitButton } = getCreateReplyForm();
                await user.type(input!, "abc");
                await user.click(submitButton!);

                expect(getCreateReplyForm().form).not.toBeInTheDocument();
            });

            it("should show error message if reply creation failed", async () => {
                const textError = "text error 123";
                const detailError = "detail error 123";
                simulateError(BASE_URL + "/videos/comments", "post", {
                    body: { text: [textError], detail: [detailError] },
                });
                const {
                    waitForDataToLoad,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getReplyButton()!);

                const { input, submitButton } = getCreateReplyForm();
                await user.type(input!, "abc");
                await user.click(submitButton!);

                await waitFor(() => {
                    const { form } = getCreateReplyForm();
                    expect(form).toHaveTextContent(textError);
                    expect(form).toHaveTextContent(detailError);
                });
            });
        });
    });

    describe("reply list", () => {
        describe("open replies button", () => {
            it("should render the button if comment has replies", async () => {
                const comment = createComment({ replyCount: 1 });
                const { waitForDataToLoad, getOpenRepliesButton } =
                    renderComponent({ comment });
                await waitForDataToLoad();

                expect(getOpenRepliesButton()).toBeInTheDocument();
            });

            it("should not render the button if comment has no replies", async () => {
                const comment = createComment({ replyCount: 0 });
                const { waitForDataToLoad, getOpenRepliesButton } =
                    renderComponent({ comment });
                await waitForDataToLoad();

                expect(getOpenRepliesButton()).not.toBeInTheDocument();
            });

            it("should show/hide the list when the button is clicked", async () => {
                const comment = createComment({ replyCount: 1 });
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                const openRepliesButton = getOpenRepliesButton()!;
                expect(getReplyList().list).not.toBeInTheDocument();

                await user.click(openRepliesButton);
                expect(getReplyList().list).toBeInTheDocument();

                await user.click(openRepliesButton);
                expect(getReplyList().list).not.toBeInTheDocument();
            });
        });

        describe("list", () => {
            it("should render replies ordered by oldest first", async () => {
                const comment = createComment({ replyCount: 1 });
                const replies = createComments(3, { parent: comment });
                sortComments(replies, "oldest_first");
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getOpenRepliesButton()!);

                const { items } = getReplyList();

                expect(items.length).toBe(replies.length);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(replies[index].text)
                );
            });

            it("should render the show more button when there are more replies", async () => {
                const comment = createComment({ replyCount: 1 });
                createComments(REPLIES_PAGE_SIZE + 1, { parent: comment });
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getOpenRepliesButton()!);

                expect(getReplyList().showMoreButton).toBeInTheDocument();
            });

            it("should not render the show more button when there are no more replies", async () => {
                const comment = createComment({ replyCount: 1 });
                createComments(REPLIES_PAGE_SIZE, { parent: comment });
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getOpenRepliesButton()!);

                expect(getReplyList().showMoreButton).not.toBeInTheDocument();
            });

            it(
                "should load more replies and hide show more button when no more replies are available",
                async () => {
                    const comment = createComment({ replyCount: 1 });
                    const replies = createComments(REPLIES_PAGE_SIZE * 3, {
                        parent: comment,
                    });
                    sortComments(replies, "oldest_first");
                    const {
                        waitForDataToLoad,
                        getOpenRepliesButton,
                        getReplyList,
                        user,
                    } = renderComponent({ comment });
                    await waitForDataToLoad();
                    await user.click(getOpenRepliesButton()!);

                    let { items, showMoreButton } = getReplyList();
                    expect(items.length).toBe(REPLIES_PAGE_SIZE);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(replies[index].text)
                    );
                    expect(showMoreButton).toBeInTheDocument();

                    await user.click(showMoreButton!);
                    ({ items, showMoreButton } = getReplyList());
                    expect(items.length).toBe(REPLIES_PAGE_SIZE * 2);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(replies[index].text)
                    );
                    expect(showMoreButton).toBeInTheDocument();

                    await user.click(showMoreButton!);
                    ({ items, showMoreButton } = getReplyList());
                    expect(items.length).toBe(REPLIES_PAGE_SIZE * 3);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(replies[index].text)
                    );
                    expect(showMoreButton).not.toBeInTheDocument();
                },
                { timeout: 20000 }
            );
        });

        describe("creating reply", () => {
            it(
                "should append created replies to the end of the list",
                async () => {
                    const comment = createComment({ replyCount: 1 });
                    const replies = createComments(2, { parent: comment });
                    sortComments(replies, "oldest_first");
                    const {
                        waitForDataToLoad,
                        getOpenRepliesButton,
                        getReplyList,
                        getReplyButton,
                        getCreateReplyForm,
                        user,
                    } = renderComponent({ comment });
                    await waitForDataToLoad();
                    const replyButton = getReplyButton()!;
                    await user.click(getOpenRepliesButton()!);
                    let { items } = getReplyList();
                    expect(items.length).toBe(2);
                    [replies[0].text, replies[1].text].forEach((text, index) =>
                        expect(items[index]).toHaveTextContent(text)
                    );

                    const newReplyText1 = faker.lorem.sentence();
                    await user.click(replyButton);
                    await user.type(getCreateReplyForm().input!, newReplyText1);
                    await user.click(getCreateReplyForm().submitButton!);
                    ({ items } = getReplyList());
                    expect(items.length).toBe(3);
                    [replies[0].text, replies[1].text, newReplyText1].forEach(
                        (text, index) =>
                            expect(items[index]).toHaveTextContent(text)
                    );

                    const newReplyText2 = faker.lorem.sentence();
                    await user.click(replyButton);
                    await user.type(getCreateReplyForm().input!, newReplyText2);
                    await user.click(getCreateReplyForm().submitButton!);
                    ({ items } = getReplyList());
                    expect(items.length).toBe(4);
                    [
                        replies[0].text,
                        replies[1].text,
                        newReplyText1,
                        newReplyText2,
                    ].forEach((text, index) =>
                        expect(items[index]).toHaveTextContent(text)
                    );
                },
                { timeout: 20000 }
            );

            it("should render created replies even if the list is closed", async () => {
                const comment = createComment({ replyCount: 1 });
                const reply = createComment({ parent: comment });
                const {
                    waitForDataToLoad,
                    getReplyList,
                    getReplyButton,
                    getCreateReplyForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();

                const newReplyText1 = faker.lorem.sentence();
                await user.click(getReplyButton()!);
                const { input, submitButton } = getCreateReplyForm();
                await user.type(input!, newReplyText1);
                await user.click(submitButton!);

                const { list, items } = getReplyList();
                expect(items.length).toBe(1);
                expect(items[0]).toHaveTextContent(newReplyText1);
                expect(list).not.toHaveTextContent(reply.text);
            });
        });

        describe("editing reply", () => {
            it("should replace reply with the edit comment form when reply is edited", async () => {
                const comment = createComment({ replyCount: 1 });
                const replies = createComments(2, {
                    parent: comment,
                    profile: getOwnProfile(),
                });
                sortComments(replies, "oldest_first");
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getOpenRepliesButton()!);
                await user.click(getActionMenuButton(getReplyList().items[0])!);
                expect(getReplyList().items.length).toBe(2);

                await user.click(getActionMenu().editItem!);

                const { items } = getReplyList();
                expect(items.length).toBe(1);
                expect(items[0]).toHaveTextContent(replies[1].text);
                const { form, input } = getEditCommentForm();
                expect(form).toBeInTheDocument();
                expect(input).toHaveValue(replies[0].text);
            });

            it("should render edit comment form correctly", async () => {
                const comment = createComment({ replyCount: 1 });
                const reply = createComment({
                    parent: comment,
                    profile: getOwnProfile(),
                });
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getOpenRepliesButton()!);
                await user.click(getActionMenuButton(getReplyList().items[0])!);
                await user.click(getActionMenu().editItem!);

                const { input, cancelButton, submitButton } =
                    getEditCommentForm();
                expect(input).toBeInTheDocument();
                expect(input).toHaveValue(reply.text);
                expect(cancelButton).toBeInTheDocument();
                expect(submitButton).toBeInTheDocument();
            });

            it("should close the form when the close button is clicked", async () => {
                const comment = createComment({ replyCount: 1 });
                const reply = createComment({
                    parent: comment,
                    profile: getOwnProfile(),
                });
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getOpenRepliesButton()!);
                await user.click(getActionMenuButton(getReplyList().items[0])!);
                await user.click(getActionMenu().editItem!);
                const { form, cancelButton } = getEditCommentForm();
                expect(form).toBeInTheDocument();
                expect(getReplyList().items.length).toBe(0);

                await user.click(cancelButton!);

                expect(getEditCommentForm().form).not.toBeInTheDocument();
                const { items } = getReplyList();
                expect(items.length).toBe(1);
                expect(items[0]).toHaveTextContent(reply.text);
            });

            it("should update comment when the save button is clicked", async () => {
                const comment = createComment({ replyCount: 1 });
                const reply = createComment({
                    parent: comment,
                    profile: getOwnProfile(),
                });
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getOpenRepliesButton()!);
                await user.click(getActionMenuButton(getReplyList().items[0])!);
                await user.click(getActionMenu().editItem!);
                const newText = "Qwerty 123";

                const { input, submitButton } = getEditCommentForm();
                await user.clear(input!);
                await user.type(input!, newText);
                await user.click(submitButton!);

                const updatedReply = db.comment.findFirst({
                    where: { id: { equals: reply.id } },
                });
                expect(updatedReply?.text).toBe(newText);
                const { items } = getReplyList();
                expect(items.length).toBe(1);
                expect(items[0]).toHaveTextContent(newText);
            });

            it("should close the form if update succeeded", async () => {
                const comment = createComment({ replyCount: 1 });
                createComment({
                    parent: comment,
                    profile: getOwnProfile(),
                });
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getOpenRepliesButton()!);
                await user.click(getActionMenuButton(getReplyList().items[0])!);
                await user.click(getActionMenu().editItem!);

                const { input, submitButton } = getEditCommentForm();
                await user.clear(input!);
                await user.type(input!, "abc");
                await user.click(submitButton!);

                expect(getEditCommentForm().form).not.toBeInTheDocument();
                const { items } = getReplyList();
                expect(items.length).toBe(1);
            });

            it("should show error message if update failed", async () => {
                const comment = createComment({ replyCount: 1 });
                const reply = createComment({
                    parent: comment,
                    profile: getOwnProfile(),
                });
                const textError = "text error 123";
                const detailError = "detail error 123";
                simulateError(
                    BASE_URL + `/videos/comments/${reply.id}`,
                    "patch",
                    {
                        body: { text: [textError], detail: [detailError] },
                    }
                );
                const {
                    waitForDataToLoad,
                    getOpenRepliesButton,
                    getReplyList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getOpenRepliesButton()!);
                await user.click(getActionMenuButton(getReplyList().items[0])!);
                await user.click(getActionMenu().editItem!);

                const { input, submitButton } = getEditCommentForm();
                await user.type(input!, "abc");
                await user.click(submitButton!);

                await waitFor(() => {
                    const { form } = getEditCommentForm();
                    expect(form).toHaveTextContent(textError);
                    expect(form).toHaveTextContent(detailError);
                });
            });
        });

        describe("deleting reply", () => {
            it(
                "should remove reply from the list when deleted",
                async () => {
                    const comment = createComment({ replyCount: 1 });
                    const replies = createComments(2, {
                        parent: comment,
                        profile: getOwnProfile(),
                    });
                    sortComments(replies, "oldest_first");
                    const {
                        waitForDataToLoad,
                        getOpenRepliesButton,
                        getReplyList,
                        getActionMenuButton,
                        getActionMenu,
                        getDeleteCommentDialog,
                        user,
                    } = renderComponent({ comment });
                    await waitForDataToLoad();
                    await user.click(getOpenRepliesButton()!);
                    expect(getReplyList().items.length).toBe(2);

                    await user.click(
                        getActionMenuButton(getReplyList().items[0])!
                    );
                    await user.click(getActionMenu().deleteItem!);
                    await user.click(getDeleteCommentDialog().deleteButton!);

                    const { items } = getReplyList();
                    expect(items.length).toBe(1);
                    expect(items[0]).toHaveTextContent(replies[1].text);
                },
                { timeout: 20000 }
            );
        });
    });

    describe("action menu", () => {
        describe("action menu button", () => {
            it("should render the action menu button", async () => {
                const { waitForDataToLoad, getActionMenuButton } =
                    renderComponent({ comment });
                await waitForDataToLoad();

                expect(getActionMenuButton()).toBeInTheDocument();
            });

            it("should show action menu when the action menu button is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();

                await user.click(getActionMenuButton()!);

                expect(getActionMenu().menu).toBeInTheDocument();
            });
        });

        describe("menu items", () => {
            it("should render correct items for own comment", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();

                await user.click(getActionMenuButton()!);

                const items = within(getActionMenu().menu!).getAllByRole(
                    "menuitem"
                );
                expect(items.length).toBe(2);
                [/edit/i, /delete/i].forEach((text, index) =>
                    expect(items[index]).toHaveTextContent(text)
                );
            });

            it("should render correct items for another user's comment", async () => {
                const comment = createComment({});
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();

                await user.click(getActionMenuButton()!);

                const items = within(getActionMenu().menu!).getAllByRole(
                    "menuitem"
                );
                expect(items.length).toBe(1);
                [/report/i].forEach((text, index) =>
                    expect(items[index]).toHaveTextContent(text)
                );
            });

            it("should call onEdit with correct value when the edit item is clicked", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    onEdit,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                expect(onEdit).not.toBeCalled();

                await user.click(getActionMenu().editItem!);

                expect(onEdit).toBeCalledTimes(1);
                expect(onEdit).toBeCalledWith(comment);
            });

            it("should show delete comment dialog when the delete item is clicked", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getDeleteCommentDialog,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                expect(getDeleteCommentDialog().dialog).not.toBeInTheDocument();

                await user.click(getActionMenu().deleteItem!);

                expect(getDeleteCommentDialog().dialog).toBeInTheDocument();
            });

            it("should show report modal when the report item is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getReportModal,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                expect(getReportModal().modal).not.toBeInTheDocument();

                await user.click(getActionMenu().reportItem!);

                expect(getReportModal().modal).toBeInTheDocument();
            });
        });

        describe("delete comment dialog", () => {
            it("should render the dialog correctly", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getDeleteCommentDialog,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                await user.click(getActionMenu().deleteItem!);

                const { cancelButton, deleteButton } = getDeleteCommentDialog();
                expect(cancelButton).toBeInTheDocument();
                expect(deleteButton).toBeInTheDocument();
            });

            it("should close the dialog when the cancel button is clicked", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getDeleteCommentDialog,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                await user.click(getActionMenu().deleteItem!);

                await user.click(getDeleteCommentDialog().cancelButton!);

                await waitFor(() =>
                    expect(
                        getDeleteCommentDialog().dialog
                    ).not.toBeInTheDocument()
                );
            });

            it("should not delete comment when the cancel button is clicked", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getDeleteCommentDialog,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                await user.click(getActionMenu().deleteItem!);
                expect(
                    db.comment.count({ where: { id: { equals: comment.id } } })
                ).toBe(1);

                await user.click(getDeleteCommentDialog().cancelButton!);

                expect(
                    db.comment.count({ where: { id: { equals: comment.id } } })
                ).toBe(1);
            });

            it("should delete comment when the delete button is clicked", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getDeleteCommentDialog,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                await user.click(getActionMenu().deleteItem!);
                expect(
                    db.comment.count({ where: { id: { equals: comment.id } } })
                ).toBe(1);

                await user.click(getDeleteCommentDialog().deleteButton!);

                expect(
                    db.comment.count({ where: { id: { equals: comment.id } } })
                ).toBe(0);
            });

            it("should close the dialog if comment deletion succeeded", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getDeleteCommentDialog,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                await user.click(getActionMenu().deleteItem!);

                await user.click(getDeleteCommentDialog().deleteButton!);

                await waitFor(() =>
                    expect(
                        getDeleteCommentDialog().dialog
                    ).not.toBeInTheDocument()
                );
            });

            it("should call onDeleted with correct value if comment deletion succeeded", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getDeleteCommentDialog,
                    onDeleted,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                await user.click(getActionMenu().deleteItem!);
                expect(onDeleted).not.toBeCalled();

                await user.click(getDeleteCommentDialog().deleteButton!);

                expect(onDeleted).toBeCalledTimes(1);
                expect(onDeleted).toBeCalledWith(comment);
            });

            it("should show error message if comment deletion failed", async () => {
                const comment = createComment({ profile: getOwnProfile() });
                simulateError(
                    BASE_URL + `/videos/comments/${comment.id}`,
                    "delete",
                    {}
                );
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getDeleteCommentDialog,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                await user.click(getActionMenu().deleteItem!);
                const { dialog, deleteButton } = getDeleteCommentDialog();

                await user.click(deleteButton!);

                const error = within(dialog!).getByRole("alert");
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/something went wrong/i);
            });
        });

        describe("report modal", () => {
            it("should close the modal when the close button is clicked", async () => {
                const {
                    waitForDataToLoad,
                    getActionMenuButton,
                    getActionMenu,
                    getReportModal,
                    user,
                } = renderComponent({ comment });
                await waitForDataToLoad();
                await user.click(getActionMenuButton()!);
                await user.click(getActionMenu().reportItem!);
                const { modal, closeButton } = getReportModal();
                expect(modal).toBeInTheDocument();

                await user.click(closeButton!);

                await waitFor(() =>
                    expect(getReportModal().modal).not.toBeInTheDocument()
                );
            });
        });
    });

    describe("highlighted comment badge", () => {
        it("should render the badge if isHighlighted prop is set to true", async () => {
            const { waitForDataToLoad, getHighlightedBadge } = renderComponent({
                comment,
                isHighlighted: true,
            });
            await waitForDataToLoad();

            expect(getHighlightedBadge()).toBeInTheDocument();
        });

        it("should not render the badge if isHighlighted prop is set to false", async () => {
            const { waitForDataToLoad, getHighlightedBadge } = renderComponent({
                comment,
                isHighlighted: false,
            });
            await waitForDataToLoad();

            expect(getHighlightedBadge()).not.toBeInTheDocument();
        });
    });
});

interface Props {
    comment: Comment;
    isReply?: boolean;
    isHighlighted?: boolean;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        isReply: false,
        isHighlighted: false,
    };

    const onReplyToReplyCreated = vi.fn();
    const onEdit = vi.fn();
    const onDeleted = vi.fn();

    const callbacks = { onReplyToReplyCreated, onEdit, onDeleted };

    const { getLocation, rerender: _rerender } = renderWithRouter(
        <Item {...{ ...defaults, ...props }} {...callbacks} />,
        useAppRoutes
    );

    const rerender = (props: Props) =>
        _rerender(<Item {...{ ...defaults, ...props }} {...callbacks} />);

    const waitForDataToLoad = () =>
        waitFor(() =>
            expect(screen.queryByRole("listitem")).toBeInTheDocument()
        );

    const getAuthorAvatar = () =>
        screen.queryByRole("img", { name: /avatar/i });
    const getAuthorUsername = () => screen.queryByLabelText(/username/i);
    const getDate = () => screen.queryByLabelText(/date/i);

    const getText = () => screen.queryByLabelText(/content/i);
    const getMentionedUsername = () =>
        within(getText()!).queryByLabelText(/mentioned/i);
    const getShowMoreButton = () =>
        screen.queryByRole("button", { name: /show more/i });
    const getShowLessButton = () =>
        screen.queryByRole("button", { name: /show less/i });

    const getLikeButton = () => screen.queryByRole("button", { name: "Like" });
    const getRemoveLikeButton = () =>
        screen.queryByRole("button", { name: "Remove like" });
    const getLikeCount = () => screen.getByLabelText(/likes/i);

    const getReplyButton = () =>
        screen.queryByRole("button", { name: /reply/i });

    const getCreateReplyForm = () => {
        const form = screen.queryByRole("form", { name: /add a reply/i })!;
        return {
            form,
            input: form && within(form).queryByPlaceholderText(/add a reply/i),
            cancelButton:
                form && within(form).queryByRole("button", { name: /cancel/i }),
            submitButton:
                form && within(form).queryByRole("button", { name: /reply/i }),
            mentionedUsername:
                form && within(form).queryByLabelText(/mentioned/i),
        };
    };

    const getOpenRepliesButton = () =>
        screen.queryByRole("button", { name: /open replies/i });
    const getReplyList = () => {
        const list = screen.queryByRole("list", { name: /replies/i });
        return {
            list,
            items: list ? within(list).queryAllByRole("listitem") : [],
            showMoreButton:
                list &&
                within(list).queryByRole("button", { name: /show more/i }),
        };
    };

    const getActionMenuButton = (comment?: HTMLElement) => {
        const container = comment ? within(comment) : screen;
        return container.queryByRole("button", { name: /action menu/i });
    };
    const getActionMenu = () => {
        const menu = screen.queryByRole("menu", { name: /actions/i });
        return {
            menu,
            editItem:
                menu && within(menu).queryByRole("menuitem", { name: /edit/i }),
            deleteItem:
                menu &&
                within(menu).queryByRole("menuitem", { name: /delete/i }),
            reportItem:
                menu &&
                within(menu).queryByRole("menuitem", { name: /report/i }),
        };
    };

    const getEditCommentForm = () => {
        const form = screen.queryByRole("form", { name: /edit comment/i });
        return {
            form,
            input: form && within(form).queryByPlaceholderText(/add a reply/i),
            cancelButton:
                form && within(form).queryByRole("button", { name: /cancel/i }),
            submitButton:
                form && within(form).queryByRole("button", { name: /save/i }),
        };
    };

    const getDeleteCommentDialog = () => {
        const dialog = screen.queryByRole("alertdialog", {
            name: /delete comment/i,
        });
        return {
            dialog,
            cancelButton:
                dialog &&
                within(dialog).queryByRole("button", { name: /cancel/i }),
            deleteButton:
                dialog &&
                within(dialog).queryByRole("button", { name: /delete/i }),
        };
    };

    const getReportModal = () => {
        const modal = screen.queryByRole("dialog", { name: /report comment/i });
        return {
            modal,
            closeButton:
                modal &&
                within(modal).queryByRole("button", { name: /close/i }),
        };
    };

    const getHighlightedBadge = () => screen.queryByRole("status");

    const user = userEvent.setup();

    return {
        rerender,
        getLocation,
        waitForDataToLoad,
        getAuthorAvatar,
        getAuthorUsername,
        getDate,
        getText,
        getMentionedUsername,
        getShowMoreButton,
        getShowLessButton,
        getLikeButton,
        getRemoveLikeButton,
        getLikeCount,
        getReplyButton,
        getCreateReplyForm,
        getOpenRepliesButton,
        getReplyList,
        getActionMenuButton,
        getActionMenu,
        getEditCommentForm,
        getDeleteCommentDialog,
        getReportModal,
        getHighlightedBadge,
        onReplyToReplyCreated,
        onEdit,
        onDeleted,
        user,
    };
}
