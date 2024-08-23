import { faker } from "@faker-js/faker";
import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import EditProfileModal from "../../src/components/EditProfileModal";
import {
    BYTES_IN_MB,
    MAX_IMAGE_SIZE_MB,
    PROFILE_DESCRIPTION_MAX_LENGTH,
    PROFILE_FULL_NAME_MAX_LENGTH,
} from "../../src/constants";
import { getOwnProfile } from "../mocks/db";
import { BASE_URL } from "../mocks/handlers/constants";
import { renderWithRouter, simulateError } from "../utils";

describe("EditProfileModal", () => {
    describe("initial state", () => {
        it("should not render modal while loading", () => {
            const { getModal } = renderComponent({ isOpen: true });

            expect(getModal()).not.toBeInTheDocument();
        });

        it("should not render modal when isOpen prop is set to false", async () => {
            const { waitForModalToLoad, getModal } = renderComponent({
                isOpen: false,
            });

            await expect(() => waitForModalToLoad()).rejects.toThrowError();
            expect(getModal()).not.toBeInTheDocument();
        });

        it("should render modal when isOpen prop is set to true", async () => {
            const { getModal, waitForModalToLoad } = renderComponent({
                isOpen: true,
            });
            await waitForModalToLoad();

            expect(getModal()).toBeInTheDocument();
        });
    });

    describe("close button", () => {
        it("should render the close button", async () => {
            const { getCloseButton, waitForModalToLoad } = renderComponent({});
            await waitForModalToLoad();

            expect(getCloseButton()).toBeInTheDocument();
        });

        it("should call onClose when the close button is clicked", async () => {
            const { waitForModalToLoad, getCloseButton, onClose, user } =
                renderComponent({});
            await waitForModalToLoad();
            expect(onClose).not.toBeCalled();

            await user.click(getCloseButton()!);

            expect(onClose).toBeCalled();
        });
    });

    describe("form", () => {
        describe("avatar input", () => {
            it("should render the input correctly", async () => {
                const { waitForModalToLoad, getAvatarInput } = renderComponent(
                    {}
                );
                await waitForModalToLoad();

                const { img, input } = getAvatarInput();
                expect(img).toBeInTheDocument();
                expect(img).toHaveAttribute("src", getOwnProfile().avatar);
                expect(input).toBeInTheDocument();
            });

            it("should upload file when the input is clicked", async () => {
                const { waitForModalToLoad, getAvatarInput, user } =
                    renderComponent({});
                await waitForModalToLoad();
                const file = new File(["a"], "a.png", { type: "image/png" });

                const { input } = getAvatarInput();
                await user.upload(input, file);

                expect(input.files?.[0]).toBe(file);
                expect(input.files?.item(0)).toBe(file);
                expect(input.files).toHaveLength(1);
            });

            it("should update avatar image src when a file is selected", async () => {
                vi.spyOn(URL, "createObjectURL").mockImplementation(
                    (obj) => (obj as File).name
                );
                const { waitForModalToLoad, getAvatarInput, user } =
                    renderComponent({});
                await waitForModalToLoad();
                const fileName = "abc123.png";
                const file = new File(["a"], fileName, { type: "image/png" });

                const { img, input } = getAvatarInput();
                await user.upload(input, file);

                expect(img).toHaveAttribute("src", fileName);
            });

            it("should show error message on submit if the file exceeds the max size", async () => {
                const { waitForModalToLoad, getAvatarInput, user, submitForm } =
                    renderComponent({});
                await waitForModalToLoad();
                const file = new File(["a"], "a.png", { type: "image/png" });
                vi.spyOn(file, "size", "get").mockReturnValue(
                    MAX_IMAGE_SIZE_MB * BYTES_IN_MB + 1
                );
                const { input } = getAvatarInput();
                await user.upload(input, file);
                expect(getAvatarInput().error).not.toBeInTheDocument();

                await submitForm();

                await waitFor(() => {
                    const { error } = getAvatarInput();
                    expect(error).toBeInTheDocument();
                    expect(error).toHaveTextContent(/image size/i);
                });
            });

            it("should show error message on submit if the file is of an unsupported format", async () => {
                const { waitForModalToLoad, getAvatarInput, user, submitForm } =
                    renderComponent({});
                await waitForModalToLoad();
                const file = new File(["a"], "a.mp4", { type: "video/mp4" });
                const { input } = getAvatarInput();
                await user.upload(input, file);
                expect(getAvatarInput().error).not.toBeInTheDocument();

                await submitForm();

                await waitFor(() => {
                    const { error } = getAvatarInput();
                    expect(error).toBeInTheDocument();
                    expect(error).toHaveTextContent(/file format/i);
                });
            });
        });

        describe("full name input", () => {
            it("should render the input correctly", async () => {
                const { waitForModalToLoad, getFullNameInput } =
                    renderComponent({});
                await waitForModalToLoad();

                const { input } = getFullNameInput();
                expect(input).toBeInTheDocument();
                expect(input).toHaveValue(getOwnProfile().full_name);
            });

            it("should show error message on submit if value is empty", async () => {
                const {
                    waitForModalToLoad,
                    getFullNameInput,
                    user,
                    submitForm,
                } = renderComponent({});
                await waitForModalToLoad();
                const { input } = getFullNameInput();
                await user.clear(input);
                expect(getFullNameInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getFullNameInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/required/i);
            });

            it("should show error message on submit if value exceeds max length", async () => {
                const {
                    waitForModalToLoad,
                    getFullNameInput,
                    user,
                    submitForm,
                } = renderComponent({});
                await waitForModalToLoad();
                const { input } = getFullNameInput();
                await user.clear(input);
                await user.type(
                    input,
                    faker.string.alpha(PROFILE_FULL_NAME_MAX_LENGTH + 1)
                );
                expect(getFullNameInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getFullNameInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/cannot be longer than/i);
            });
        });

        describe("description input", () => {
            it("should render the input correctly", async () => {
                const { waitForModalToLoad, getDescriptionInput } =
                    renderComponent({});
                await waitForModalToLoad();

                const { input } = getDescriptionInput();
                expect(input).toBeInTheDocument();
                expect(input).toHaveValue(getOwnProfile().description);
            });

            it("should show error message on submit if value exceeds max length", async () => {
                const {
                    waitForModalToLoad,
                    getDescriptionInput,
                    user,
                    submitForm,
                } = renderComponent({});
                await waitForModalToLoad();
                const { input } = getDescriptionInput();
                await user.clear(input);
                await user.type(
                    input,
                    faker.string.alpha(PROFILE_DESCRIPTION_MAX_LENGTH + 1)
                );
                expect(getDescriptionInput().error).not.toBeInTheDocument();

                await submitForm();

                const { error } = getDescriptionInput();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/cannot be longer than/i);
            });
        });

        describe("save button", () => {
            it("should render the save button", async () => {
                const { waitForModalToLoad, getSaveButton } = renderComponent(
                    {}
                );
                await waitForModalToLoad();

                expect(getSaveButton()).toBeInTheDocument();
            });
        });

        describe("updating profile", () => {
            it("should update profile on submit", async () => {
                const newAvatar = "tommy.png";
                const newFullName = "Tommy Atkins";
                const newDescription = "abc 123";
                const {
                    waitForModalToLoad,
                    getAvatarInput,
                    getFullNameInput,
                    getDescriptionInput,
                    user,
                    submitForm,
                } = renderComponent({});
                await waitForModalToLoad();
                const file = new File(["a"], newAvatar, { type: "image/png" });
                await user.upload(getAvatarInput().input, file);
                await user.clear(getFullNameInput().input);
                await user.type(getFullNameInput().input, newFullName);
                await user.clear(getDescriptionInput().input);
                await user.type(getDescriptionInput().input, newDescription);

                await submitForm();

                const { avatar, full_name, description } = getOwnProfile();
                expect(avatar).toBe(newAvatar);
                expect(full_name).toBe(newFullName);
                expect(description).toBe(newDescription);
            });

            it("should call onClose if update succeeded", async () => {
                const {
                    waitForModalToLoad,
                    getFullNameInput,
                    user,
                    submitForm,
                    onClose,
                } = renderComponent({});
                await waitForModalToLoad();
                await user.clear(getFullNameInput().input);
                await user.type(getFullNameInput().input, "a");
                expect(onClose).not.toBeCalled();

                await submitForm();

                expect(onClose).toBeCalledTimes(1);
            });

            it("should not call onClose if update failed", async () => {
                simulateError(BASE_URL + "/profiles/profiles/me/", "patch");
                const {
                    waitForModalToLoad,
                    getFullNameInput,
                    user,
                    submitForm,
                    onClose,
                } = renderComponent({});
                await waitForModalToLoad();
                await user.clear(getFullNameInput().input);
                await user.type(getFullNameInput().input, "a");
                expect(onClose).not.toBeCalled();

                await submitForm();

                expect(onClose).not.toBeCalled();
            });

            it("should show error messages if update failed", async () => {
                const avatarError = "avatar error 123";
                const fullNameError = "full name error 123";
                const descriptionError = "description error 123";
                simulateError(BASE_URL + "/profiles/profiles/me/", "patch", {
                    body: {
                        avatar: [avatarError],
                        full_name: [fullNameError],
                        description: [descriptionError],
                    },
                });
                const {
                    waitForModalToLoad,
                    getAvatarInput,
                    getFullNameInput,
                    getDescriptionInput,
                    submitForm,
                } = renderComponent({});
                await waitForModalToLoad();

                await submitForm();

                let error = getAvatarInput().error;
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(avatarError);
                error = getFullNameInput().error;
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(fullNameError);
                error = getDescriptionInput().error;
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(descriptionError);
            });
        });
    });
});

interface Props {
    isOpen?: boolean;
}

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        isOpen: true,
    };

    const onClose = vi.fn();

    const { getLocation } = renderWithRouter(
        <EditProfileModal {...{ ...defaults, ...props }} onClose={onClose} />,
        useAppRoutes
    );

    const getModal = () =>
        screen.queryByRole("dialog", { name: /edit profile/i });
    const getCloseButton = () =>
        within(getModal()!).queryByRole("button", { name: /close/i });

    const getAvatarInput = () => {
        const group = within(getModal()!).getByRole("group", {
            name: /upload avatar/i,
        });
        return {
            img: within(group).getByRole("img"),
            input: within(group).getByTestId<HTMLInputElement>("avatar-input"),
            error: within(group).queryByRole("alert"),
        };
    };

    const getFullNameInput = () => {
        const group = within(getModal()!).getByRole("group", {
            name: /full name/i,
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

    const user = userEvent.setup();

    const waitForModalToLoad = () =>
        waitFor(() => expect(getModal()).toBeInTheDocument(), {
            timeout: 5000,
        });

    const submitForm = () => user.click(getSaveButton());

    return {
        getLocation,
        getModal,
        getCloseButton,
        getAvatarInput,
        getFullNameInput,
        getDescriptionInput,
        getSaveButton,
        user,
        waitForModalToLoad,
        submitForm,
        onClose,
    };
}
