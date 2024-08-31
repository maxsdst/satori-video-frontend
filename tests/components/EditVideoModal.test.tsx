import { faker } from "@faker-js/faker";
import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import EditVideoModal from "../../src/components/EditVideoModal";
import {
    VIDEO_DESCRIPTION_MAX_LENGTH,
    VIDEO_TITLE_MAX_LENGTH,
} from "../../src/constants";
import Video from "../../src/entities/Video";
import { db, getOwnProfile } from "../mocks/db";
import { BASE_URL } from "../mocks/handlers/constants";
import { createVideo, renderWithRouter, simulateError } from "../utils";

describe("EditVideoModal", () => {
    let video: Video;

    beforeEach(() => {
        video = createVideo({ profile: getOwnProfile() });
    });

    describe("initial state", () => {
        it("should not render modal when isOpen prop is set to false", () => {
            const { getModal } = renderComponent({ video, isOpen: false });

            expect(getModal()).not.toBeInTheDocument();
        });

        it("should render modal when isOpen prop is set to true", () => {
            const { getModal } = renderComponent({ video, isOpen: true });

            expect(getModal()).toBeInTheDocument();
        });
    });

    describe("close button", () => {
        it("should render the close button", () => {
            const { getCloseButton } = renderComponent({ video });

            expect(getCloseButton()).toBeInTheDocument();
        });

        it("should call onClose when the close button is clicked", async () => {
            const { getCloseButton, onClose, user } = renderComponent({
                video,
            });
            expect(onClose).not.toBeCalled();

            await user.click(getCloseButton());

            expect(onClose).toBeCalled();
        });
    });

    describe("form", () => {
        describe("title input", () => {
            it("should render the input correctly", () => {
                const { getTitleInput } = renderComponent({ video });

                const { input } = getTitleInput();
                expect(input).toBeInTheDocument();
                expect(input).toHaveValue(video.title);
            });

            it("should show error message on submit if value is empty", async () => {
                const { getTitleInput, user, submitForm } = renderComponent({
                    video,
                });
                const { input } = getTitleInput();
                await user.clear(input);
                expect(getTitleInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getTitleInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/empty/i);
            });

            it("should show error message on submit if value exceeds max length", async () => {
                const { getTitleInput, user, submitForm } = renderComponent({
                    video,
                });
                const { input } = getTitleInput();
                await user.clear(input);
                await user.type(
                    input,
                    faker.string.alpha(VIDEO_TITLE_MAX_LENGTH + 1)
                );
                expect(getTitleInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getTitleInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/cannot be longer than/i);
            });
        });

        describe("description input", () => {
            it("should render the input correctly", () => {
                const { getDescriptionInput } = renderComponent({ video });

                const { input } = getDescriptionInput();
                expect(input).toBeInTheDocument();
                expect(input).toHaveValue(video.description);
            });

            it("should show error message on submit if value exceeds max length", async () => {
                const { getDescriptionInput, user, submitForm } =
                    renderComponent({ video });
                const { input } = getDescriptionInput();
                await user.clear(input);
                await user.click(input);
                await user.paste(
                    faker.string.alpha(VIDEO_DESCRIPTION_MAX_LENGTH + 1)
                );
                expect(getDescriptionInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getDescriptionInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/cannot be longer than/i);
            });
        });

        describe("save button", () => {
            it("should render the save button", () => {
                const { getSaveButton } = renderComponent({ video });

                expect(getSaveButton()).toBeInTheDocument();
            });
        });

        describe("player", () => {
            it("should render the player correctly", async () => {
                const { getPlayer } = renderComponent({ video });

                await waitFor(() => {
                    const {
                        wrapper,
                        likeButton,
                        commentsButton,
                        moreActionsButton,
                        authorAvatar,
                        authorUsername,
                        videoTitle,
                    } = getPlayer();
                    expect(wrapper).toHaveStyle({
                        "background-image": `url("${video.first_frame}")`,
                    });
                    expect(likeButton).not.toBeInTheDocument();
                    expect(commentsButton).not.toBeInTheDocument();
                    expect(moreActionsButton).not.toBeInTheDocument();
                    expect(authorAvatar).not.toBeInTheDocument();
                    expect(authorUsername).not.toBeInTheDocument();
                    expect(videoTitle).not.toBeInTheDocument();
                });
            });
        });

        describe("video link", () => {
            it("should render the video link correctly", () => {
                const { getVideoLink } = renderComponent({ video });

                const pathname = "/videos/" + video.id;
                const link = getVideoLink();
                expect(link).toHaveAttribute("href", pathname);
                expect(link).toHaveTextContent(
                    window.location.origin + pathname
                );
            });
        });

        describe("updating video", () => {
            it("should update video on submit", async () => {
                const newTitle = "test 123";
                const newDescription = "abc 123";
                const { getTitleInput, getDescriptionInput, user, submitForm } =
                    renderComponent({ video });
                await user.clear(getTitleInput().input);
                await user.type(getTitleInput().input, newTitle);
                await user.clear(getDescriptionInput().input);
                await user.type(getDescriptionInput().input, newDescription);

                await submitForm();

                const updatedVideo = db.video.findFirst({
                    where: { id: { equals: video.id } },
                });
                expect(updatedVideo?.title).toBe(newTitle);
                expect(updatedVideo?.description).toBe(newDescription);
            });

            it("should call onClose if update succeeded", async () => {
                const { submitForm, onClose } = renderComponent({ video });
                expect(onClose).not.toBeCalled();

                await submitForm();

                expect(onClose).toBeCalledTimes(1);
            });

            it("should call onVideoEdited if update succeeded", async () => {
                const newTitle = "test 123";
                const { getTitleInput, user, submitForm, onVideoEdited } =
                    renderComponent({ video });
                await user.clear(getTitleInput().input);
                await user.type(getTitleInput().input, newTitle);
                expect(onVideoEdited).not.toBeCalled();

                await submitForm();

                expect(onVideoEdited).toBeCalledTimes(1);
                const updatedVideo = (
                    onVideoEdited.mock.lastCall as [Video]
                )[0];
                expect(updatedVideo.id).toBe(video.id);
                expect(updatedVideo.title).toBe(newTitle);
            });

            it("should not call onClose if update failed", async () => {
                simulateError(BASE_URL + `/videos/videos/${video.id}`, "patch");
                const { submitForm, onClose } = renderComponent({ video });
                expect(onClose).not.toBeCalled();

                await submitForm();

                expect(onClose).not.toBeCalled();
            });

            it("should show error messages if update failed", async () => {
                const titleError = "title error 123";
                const descriptionError = "description error 123";
                simulateError(
                    BASE_URL + `/videos/videos/${video.id}`,
                    "patch",
                    {
                        body: {
                            title: [titleError],
                            description: [descriptionError],
                        },
                    }
                );
                const { getTitleInput, getDescriptionInput, submitForm } =
                    renderComponent({ video });

                await submitForm();

                let error = getTitleInput().error;
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(titleError);
                error = getDescriptionInput().error;
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(descriptionError);
            });
        });
    });
});

interface Props {
    video: Video;
    isOpen?: boolean;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        isOpen: true,
    };

    const onClose = vi.fn();
    const onVideoEdited = vi.fn();

    const { getLocation } = renderWithRouter(
        <EditVideoModal
            onClose={onClose}
            onVideoEdited={onVideoEdited}
            {...{ ...defaults, ...props }}
        />,
        useAppRoutes
    );

    const getModal = () =>
        screen.queryByRole("dialog", { name: /edit video/i });

    const getCloseButton = () =>
        within(getModal()!).getByRole("button", { name: /close/i });

    const getTitleInput = () => {
        const group = within(getModal()!).getByRole("group", {
            name: /title/i,
        });
        return {
            input: within(group).getByRole("textbox"),
            error: within(group).queryByRole("alert"),
        };
    };

    const getDescriptionInput = () => {
        const group = within(getModal()!).getByRole("group", {
            name: /description/i,
        });
        return {
            input: within(group).getByRole("textbox"),
            error: within(group).queryByRole("alert"),
        };
    };

    const getSaveButton = () =>
        within(getModal()!).getByRole("button", { name: /save/i });

    const getPlayer = () => {
        const player = within(getModal()!).getByTestId("player");
        return {
            wrapper: within(player).getByTestId("player-wrapper"),
            likeButton: within(player).queryByRole("button", { name: /like/i }),
            commentsButton: within(player).queryByRole("button", {
                name: /comments/i,
            }),
            moreActionsButton: within(player).queryByRole("button", {
                name: /more actions/i,
            }),
            authorAvatar: within(player).queryByRole("img", {
                name: /avatar/i,
            }),
            authorUsername: within(player).queryByRole("heading", {
                name: /username/i,
            }),
            videoTitle: within(player).queryByLabelText(/title/i),
        };
    };

    const getVideoLink = () =>
        within(getModal()!).getByRole("link", { name: /video link/i });

    const user = userEvent.setup();

    const submitForm = () => user.click(getSaveButton());

    return {
        getLocation,
        getModal,
        getCloseButton,
        getTitleInput,
        getDescriptionInput,
        getSaveButton,
        getPlayer,
        getVideoLink,
        user,
        submitForm,
        onClose,
        onVideoEdited,
    };
}
