import { faker } from "@faker-js/faker";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Comments from "../../../../src/components/Player/Comments";
import Video from "../../../../src/entities/Video";
import { db, getOwnProfile } from "../../../mocks/db";
import { BASE_URL } from "../../../mocks/handlers/constants";
import {
    countComments,
    createComment,
    createComments,
    createProfile,
    renderWithRouter,
    simulateError,
    simulateScrollToEnd,
    sortComments,
} from "../../../utils";

describe("Comments", () => {
    const COMMENTS_PAGE_SIZE = 20;

    let video: Video;

    beforeEach(() => {
        video = db.video.create({ profile: createProfile({}) }) as Video;
    });

    describe("comment count", () => {
        it("should render the comment count", () => {
            const { commentCount } = renderComponent({ video });

            expect(commentCount).toBeInTheDocument();
            expect(
                within(commentCount).getByText(/comments/i)
            ).toBeInTheDocument();
            expect(
                within(commentCount).getByText(video.comment_count)
            ).toBeInTheDocument();
        });
    });

    describe("sort menu", () => {
        describe("sort button", () => {
            it("should render the sort button", () => {
                const { sortButton } = renderComponent({ video });

                expect(sortButton).toBeInTheDocument();
            });

            it("should show sort menu when the sort button is clicked", async () => {
                const { sortButton, getSortMenu, user } = renderComponent({
                    video,
                });

                await user.click(sortButton);

                expect(getSortMenu().menu).toBeInTheDocument();
            });
        });

        describe("menu", () => {
            it("should render menu correctly", async () => {
                const { sortButton, getSortMenu, user } = renderComponent({
                    video,
                });
                await user.click(sortButton);

                const { topCommentsItem, newestFirstItem } = getSortMenu();
                expect(topCommentsItem).toBeInTheDocument();
                expect(newestFirstItem).toBeInTheDocument();
            });

            it("should hide the menu when an item is clicked", async () => {
                const { sortButton, getSortMenu, user } = renderComponent({
                    video,
                });
                await user.click(sortButton);
                const { menu, topCommentsItem } = getSortMenu();
                expect(menu).toBeInTheDocument();

                await user.click(topCommentsItem!);

                await waitFor(() =>
                    expect(getSortMenu().menu).not.toBeInTheDocument()
                );
            });

            it(
                "should sort comments by popularity when the top comments item is clicked",
                async () => {
                    const comment1 = createComment({
                        video,
                        popularityScore: 3,
                        creationDate: new Date(2022),
                    });
                    const comment2 = createComment({
                        video,
                        popularityScore: 2,
                        creationDate: new Date(2023),
                    });
                    const comment3 = createComment({
                        video,
                        popularityScore: 1,
                        creationDate: new Date(2024),
                    });
                    const { sortButton, getSortMenu, getCommentList, user } =
                        renderComponent({
                            video,
                        });
                    await user.click(sortButton);
                    await user.click(getSortMenu().newestFirstItem!);
                    let items = getCommentList().items;
                    [comment3, comment2, comment1].forEach((comment, index) =>
                        expect(items[index]).toHaveTextContent(comment.text)
                    );

                    await user.click(sortButton);
                    await user.click(getSortMenu().topCommentsItem!);

                    items = getCommentList().items;
                    [comment1, comment2, comment3].forEach((comment, index) =>
                        expect(items[index]).toHaveTextContent(comment.text)
                    );
                },
                { timeout: 20000 }
            );

            it(
                "should sort comments by newest first when the newest first item is clicked",
                async () => {
                    const comment1 = createComment({
                        video,
                        popularityScore: 3,
                        creationDate: new Date(2022),
                    });
                    const comment2 = createComment({
                        video,
                        popularityScore: 2,
                        creationDate: new Date(2023),
                    });
                    const comment3 = createComment({
                        video,
                        popularityScore: 1,
                        creationDate: new Date(2024),
                    });
                    const { sortButton, getSortMenu, getCommentList, user } =
                        renderComponent({
                            video,
                        });
                    await user.click(sortButton);
                    await user.click(getSortMenu().topCommentsItem!);
                    let items = getCommentList().items;
                    [comment1, comment2, comment3].forEach((comment, index) =>
                        expect(items[index]).toHaveTextContent(comment.text)
                    );

                    await user.click(sortButton);
                    await user.click(getSortMenu().newestFirstItem!);

                    items = getCommentList().items;
                    [comment3, comment2, comment1].forEach((comment, index) =>
                        expect(items[index]).toHaveTextContent(comment.text)
                    );
                },
                { timeout: 20000 }
            );
        });
    });

    describe("close button", () => {
        it("should render the close button", () => {
            const { closeButton } = renderComponent({ video });

            expect(closeButton).toBeInTheDocument();
        });

        it("should call onClose when the button is clicked", async () => {
            const { closeButton, onClose, user } = renderComponent({ video });
            expect(onClose).not.toBeCalled();

            await user.click(closeButton);

            expect(onClose).toBeCalled();
        });
    });

    describe("comment list", () => {
        describe("list", () => {
            it("should render comments ordered by popularity", async () => {
                const comments = createComments(3, { video });
                sortComments(comments, "popularity");
                const { waitForDataToLoad, getCommentList } = renderComponent({
                    video,
                });
                await waitForDataToLoad();

                const { items } = getCommentList();
                expect(items.length).toBe(comments.length);
                items.forEach((item, index) =>
                    expect(item).toHaveTextContent(comments[index].text)
                );
            });

            it(
                "should render the spinner when there are more comments",
                async () => {
                    createComments(COMMENTS_PAGE_SIZE + 1, { video });
                    const { waitForDataToLoad, getCommentList } =
                        renderComponent({
                            video,
                        });
                    await waitForDataToLoad();

                    expect(getCommentList().spinner).toBeInTheDocument();
                },
                { timeout: 20000 }
            );

            it(
                "should not render the spinner when there are no more comments",
                async () => {
                    createComments(COMMENTS_PAGE_SIZE, { video });
                    const { waitForDataToLoad, getCommentList } =
                        renderComponent({
                            video,
                        });
                    await waitForDataToLoad();

                    expect(getCommentList().spinner).not.toBeInTheDocument();
                },
                { timeout: 20000 }
            );

            it(
                "should load more comments on scroll and hide spinner when no more comments are available",
                async () => {
                    const comments = createComments(COMMENTS_PAGE_SIZE * 3, {
                        video,
                    });
                    sortComments(comments, "popularity");
                    const {
                        waitForDataToLoad,
                        commentListContainer,
                        getCommentList,
                    } = renderComponent({ video });
                    await waitForDataToLoad();

                    let { items, spinner } = getCommentList();
                    expect(items.length).toBe(COMMENTS_PAGE_SIZE);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(comments[index].text)
                    );
                    expect(spinner).toBeInTheDocument();

                    await simulateScrollToEnd(commentListContainer);
                    ({ items, spinner } = getCommentList());
                    expect(items.length).toBe(COMMENTS_PAGE_SIZE * 2);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(comments[index].text)
                    );
                    expect(spinner).toBeInTheDocument();

                    await simulateScrollToEnd(commentListContainer);
                    ({ items, spinner } = getCommentList());
                    expect(items.length).toBe(COMMENTS_PAGE_SIZE * 3);
                    items.forEach((item, index) =>
                        expect(item).toHaveTextContent(comments[index].text)
                    );
                    expect(spinner).not.toBeInTheDocument();
                },
                { timeout: 60000 }
            );
        });

        describe("creating comment", () => {
            it(
                "should prepend created comments to the start of the list",
                async () => {
                    const comments = createComments(2, { video });
                    sortComments(comments, "popularity");
                    const {
                        waitForDataToLoad,
                        getCommentList,
                        getCreateCommentForm,
                        user,
                    } = renderComponent({ video });
                    await waitForDataToLoad();
                    let { items } = getCommentList();
                    expect(items.length).toBe(2);
                    [comments[0].text, comments[1].text].forEach(
                        (text, index) =>
                            expect(items[index]).toHaveTextContent(text)
                    );

                    const newCommentText1 = faker.lorem.sentence();
                    await user.type(
                        getCreateCommentForm().input!,
                        newCommentText1
                    );
                    await user.click(getCreateCommentForm().getSubmitButton()!);
                    ({ items } = getCommentList());
                    expect(items.length).toBe(3);
                    [
                        newCommentText1,
                        comments[0].text,
                        comments[1].text,
                    ].forEach((text, index) =>
                        expect(items[index]).toHaveTextContent(text)
                    );

                    const newCommentText2 = faker.lorem.sentence();
                    await user.type(
                        getCreateCommentForm().input!,
                        newCommentText2
                    );
                    await user.click(getCreateCommentForm().getSubmitButton()!);
                    ({ items } = getCommentList());
                    expect(items.length).toBe(4);
                    [
                        newCommentText2,
                        newCommentText1,
                        comments[0].text,
                        comments[1].text,
                    ].forEach((text, index) =>
                        expect(items[index]).toHaveTextContent(text)
                    );
                },
                { timeout: 20000 }
            );
        });

        describe("editing comment", () => {
            it("should replace comment with the edit comment form when comment is edited", async () => {
                const comments = createComments(2, {
                    video,
                    profile: getOwnProfile(),
                });
                sortComments(comments, "popularity");
                const {
                    waitForDataToLoad,
                    getCommentList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ video });
                await waitForDataToLoad();
                await user.click(
                    getActionMenuButton(getCommentList().items[0])!
                );
                expect(getCommentList().items.length).toBe(2);

                await user.click(getActionMenu().editItem!);

                const { items } = getCommentList();
                expect(items.length).toBe(1);
                expect(items[0]).toHaveTextContent(comments[1].text);
                const { form, input } = getEditCommentForm();
                expect(form).toBeInTheDocument();
                expect(input).toHaveValue(comments[0].text);
            });

            it("should render edit comment form correctly", async () => {
                const comment = createComment({
                    video,
                    profile: getOwnProfile(),
                });
                const {
                    waitForDataToLoad,
                    getCommentList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ video });
                await waitForDataToLoad();
                await user.click(
                    getActionMenuButton(getCommentList().items[0])!
                );
                await user.click(getActionMenu().editItem!);

                const { input, cancelButton, submitButton } =
                    getEditCommentForm();
                expect(input).toBeInTheDocument();
                expect(input).toHaveValue(comment.text);
                expect(cancelButton).toBeInTheDocument();
                expect(submitButton).toBeInTheDocument();
            });

            it("should close the form when the close button is clicked", async () => {
                const comment = createComment({
                    video,
                    profile: getOwnProfile(),
                });
                const {
                    waitForDataToLoad,
                    getCommentList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ video });
                await waitForDataToLoad();
                await user.click(
                    getActionMenuButton(getCommentList().items[0])!
                );
                await user.click(getActionMenu().editItem!);
                const { form, cancelButton } = getEditCommentForm();
                expect(form).toBeInTheDocument();
                expect(getCommentList().items.length).toBe(0);

                await user.click(cancelButton!);

                expect(getEditCommentForm().form).not.toBeInTheDocument();
                const { items } = getCommentList();
                expect(items.length).toBe(1);
                expect(items[0]).toHaveTextContent(comment.text);
            });

            it("should update comment when the save button is clicked", async () => {
                const comment = createComment({
                    video,
                    profile: getOwnProfile(),
                });
                const {
                    waitForDataToLoad,
                    getCommentList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ video });
                await waitForDataToLoad();
                await user.click(
                    getActionMenuButton(getCommentList().items[0])!
                );
                await user.click(getActionMenu().editItem!);
                const newText = "Qwerty 123";

                const { input, submitButton } = getEditCommentForm();
                await user.clear(input!);
                await user.type(input!, newText);
                await user.click(submitButton!);

                const updatedComment = db.comment.findFirst({
                    where: { id: { equals: comment.id } },
                });
                expect(updatedComment?.text).toBe(newText);
                const { items } = getCommentList();
                expect(items.length).toBe(1);
                expect(items[0]).toHaveTextContent(newText);
            });

            it("should close the form if update succeeded", async () => {
                createComment({
                    video,
                    profile: getOwnProfile(),
                });
                const {
                    waitForDataToLoad,
                    getCommentList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ video });
                await waitForDataToLoad();
                await user.click(
                    getActionMenuButton(getCommentList().items[0])!
                );
                await user.click(getActionMenu().editItem!);

                const { input, submitButton } = getEditCommentForm();
                await user.clear(input!);
                await user.type(input!, "abc");
                await user.click(submitButton!);

                expect(getEditCommentForm().form).not.toBeInTheDocument();
                const { items } = getCommentList();
                expect(items.length).toBe(1);
            });

            it("should show error message if update failed", async () => {
                const comment = createComment({
                    video,
                    profile: getOwnProfile(),
                });
                const textError = "text error 123";
                const detailError = "detail error 123";
                simulateError(
                    BASE_URL + `/videos/comments/${comment.id}`,
                    "patch",
                    {
                        body: { text: [textError], detail: [detailError] },
                    }
                );
                const {
                    waitForDataToLoad,
                    getCommentList,
                    getActionMenuButton,
                    getActionMenu,
                    getEditCommentForm,
                    user,
                } = renderComponent({ video });
                await waitForDataToLoad();
                await user.click(
                    getActionMenuButton(getCommentList().items[0])!
                );
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

        describe("deleting comment", () => {
            it(
                "should remove comment from the list when deleted",
                async () => {
                    const comments = createComments(2, {
                        video,
                        profile: getOwnProfile(),
                    });
                    sortComments(comments, "popularity");
                    const {
                        waitForDataToLoad,
                        getCommentList,
                        getActionMenuButton,
                        getActionMenu,
                        getDeleteCommentDialog,
                        user,
                    } = renderComponent({ video });
                    await waitForDataToLoad();
                    expect(getCommentList().items.length).toBe(2);

                    await user.click(
                        getActionMenuButton(getCommentList().items[0])!
                    );
                    await user.click(getActionMenu().deleteItem!);
                    await user.click(getDeleteCommentDialog().deleteButton!);

                    const { items } = getCommentList();
                    expect(items.length).toBe(1);
                    expect(items[0]).toHaveTextContent(comments[1].text);
                },
                { timeout: 20000 }
            );
        });
    });

    describe("create comment form", () => {
        it("should render the form correctly", async () => {
            const { waitForDataToLoad, getCreateCommentForm } = renderComponent(
                { video }
            );
            await waitForDataToLoad();

            const { form, input, getCancelButton, getSubmitButton } =
                getCreateCommentForm();
            expect(form).toBeInTheDocument();
            const avatar = within(form).getByRole("img");
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute("src", getOwnProfile().avatar);
            expect(input).toBeInTheDocument();
            expect(getCancelButton()).not.toBeInTheDocument();
            expect(getSubmitButton()).not.toBeInTheDocument();
        });

        it("should show cancel and submit buttons when the input is focused", async () => {
            const { waitForDataToLoad, getCreateCommentForm, user } =
                renderComponent({ video });
            await waitForDataToLoad();
            const { input, getCancelButton, getSubmitButton } =
                getCreateCommentForm();
            expect(getCancelButton()).not.toBeInTheDocument();
            expect(getSubmitButton()).not.toBeInTheDocument();

            await user.click(input!);

            expect(getCancelButton()).toBeInTheDocument();
            expect(getSubmitButton()).toBeInTheDocument();
        });

        it("should hide cancel and submit buttons and clear the input when the cancel button is clicked", async () => {
            const { waitForDataToLoad, getCreateCommentForm, user } =
                renderComponent({ video });
            await waitForDataToLoad();
            const { input, getCancelButton, getSubmitButton } =
                getCreateCommentForm();
            await user.type(input!, "abc");
            expect(getCancelButton()).toBeInTheDocument();
            expect(getSubmitButton()).toBeInTheDocument();

            await user.click(getCancelButton()!);

            expect(input).toHaveValue("");
            expect(getCancelButton()).not.toBeInTheDocument();
            expect(getSubmitButton()).not.toBeInTheDocument();
        });

        it("should create comment when the submit button is clicked", async () => {
            const { waitForDataToLoad, getCreateCommentForm, user } =
                renderComponent({ video });
            await waitForDataToLoad();
            const { input, getSubmitButton } = getCreateCommentForm();
            const text = "abc 123";
            await user.type(input!, text);
            expect(countComments({ videoId: video.id, text })).toBe(0);

            await user.click(getSubmitButton()!);

            expect(countComments({ videoId: video.id, text })).toBe(1);
            const comment = db.comment.findFirst({
                where: { video: { equals: video.id }, text: { equals: text } },
            });
            expect(comment?.parent).toBe(null);
            expect(comment?.mentioned_profile).toBe(null);
        });

        it("should hide cancel and submit buttons and clear the input if creation succeeded", async () => {
            const { waitForDataToLoad, getCreateCommentForm, user } =
                renderComponent({ video });
            await waitForDataToLoad();

            const { input, getCancelButton, getSubmitButton } =
                getCreateCommentForm();
            await user.type(input!, "abc");
            await user.click(getSubmitButton()!);

            expect(input).toHaveValue("");
            expect(getCancelButton()).not.toBeInTheDocument();
            expect(getSubmitButton()).not.toBeInTheDocument();
        });

        it("should show error message if creation failed", async () => {
            const textError = "text error 123";
            const detailError = "detail error 123";
            simulateError(BASE_URL + "/videos/comments/", "post", {
                body: { text: [textError], detail: [detailError] },
            });
            const { waitForDataToLoad, getCreateCommentForm, user } =
                renderComponent({ video });
            await waitForDataToLoad();

            const { input, getSubmitButton } = getCreateCommentForm();
            await user.type(input!, "abc");
            await user.click(getSubmitButton()!);

            await waitFor(() => {
                const { form } = getCreateCommentForm();
                expect(form).toHaveTextContent(textError);
                expect(form).toHaveTextContent(detailError);
            });
        });
    });
});

interface Props {
    video: Video;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const onClose = vi.fn();

    const { getLocation } = renderWithRouter(
        <Comments {...props} onClose={onClose} />,
        useAppRoutes
    );

    const waitForDataToLoad = () =>
        waitFor(() => expect(screen.getByRole("list")).toBeInTheDocument());

    const commentCount = screen.getByLabelText(/number of comments/i);

    const sortButton = screen.getByRole("button", { name: /sort/i });
    const getSortMenu = () => {
        const menu = screen.queryByRole("menu", { name: /sort comments/i });
        return {
            menu,
            topCommentsItem:
                menu &&
                within(menu).queryByRole("menuitem", { name: /top comments/i }),
            newestFirstItem:
                menu &&
                within(menu).queryByRole("menuitem", { name: /newest first/i }),
        };
    };

    const closeButton = screen.getByRole("button", { name: /close/i });

    const commentListContainer = screen.getByTestId("comment-list-container");
    const getCommentList = () => {
        const list = screen.queryByRole("list", { name: /comments/i });
        return {
            list,
            items: list ? within(list).queryAllByRole("listitem") : [],
            spinner:
                list &&
                within(list).queryByRole("progressbar", {
                    name: /loading comments/i,
                }),
        };
    };

    const getCreateCommentForm = () => {
        const form = screen.queryByRole("form", {
            name: /add a comment/i,
        })!;
        return {
            form,
            input:
                form && within(form).queryByPlaceholderText(/add a comment/i),
            getCancelButton: () =>
                form && within(form).queryByRole("button", { name: /cancel/i }),
            getSubmitButton: () =>
                form &&
                within(form).queryByRole("button", { name: /comment/i }),
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
        };
    };

    const getEditCommentForm = () => {
        const form = screen.queryByRole("form", { name: /edit comment/i });
        return {
            form,
            input:
                form && within(form).queryByPlaceholderText(/add a comment/i),
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
            deleteButton:
                dialog &&
                within(dialog).queryByRole("button", { name: /delete/i }),
        };
    };

    const user = userEvent.setup();

    return {
        getLocation,
        waitForDataToLoad,
        commentCount,
        sortButton,
        getSortMenu,
        closeButton,
        commentListContainer,
        getCommentList,
        getCreateCommentForm,
        getActionMenuButton,
        getActionMenu,
        getEditCommentForm,
        getDeleteCommentDialog,
        onClose,
        user,
    };
}
