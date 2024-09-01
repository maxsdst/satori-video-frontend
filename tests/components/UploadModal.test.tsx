import { fireEvent, screen, waitFor, within } from "@testing-library/dom";
import { act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadModal from "../../src/components/UploadModal";
import { BYTES_IN_MB, MAX_VIDEO_SIZE_MB } from "../../src/constants";
import { db } from "../mocks/db";
import { BASE_URL } from "../mocks/handlers/constants";
import {
    countUploads,
    createVideo,
    renderWithRouter,
    simulateDelay,
    simulateError,
} from "../utils";

describe("UploadModal", () => {
    describe("initial state", () => {
        it("should not render modal when isOpen prop is set to false", () => {
            const { getModal } = renderComponent({ isOpen: false });

            expect(getModal()).not.toBeInTheDocument();
        });

        it("should render modal when isOpen prop is set to true", () => {
            const { getModal } = renderComponent({ isOpen: true });

            expect(getModal()).toBeInTheDocument();
        });
    });

    describe("close button", () => {
        it("should render the close button", () => {
            const { getCloseButton } = renderComponent({});

            expect(getCloseButton()).toBeInTheDocument();
        });

        it("should call onClose when the close button is clicked", async () => {
            const { getCloseButton, onClose, user } = renderComponent({});
            expect(onClose).not.toBeCalled();

            await user.click(getCloseButton());

            expect(onClose).toBeCalled();
        });
    });

    describe("select file button", () => {
        it("should render the select file button", () => {
            const { getSelectFileButton } = renderComponent({});

            expect(getSelectFileButton()).toBeInTheDocument();
        });
    });

    describe("uploading file", () => {
        it("should create upload when the file is selected", async () => {
            const filename = "test123.mp4";
            const file = new File(["a"], filename, { type: "video/mp4" });
            const { uploadFile } = renderComponent({});
            expect(countUploads(filename)).toBe(0);

            await uploadFile(file);

            expect(countUploads(filename)).toBe(1);
        });

        it("should show error message if the file exceeds the max size", async () => {
            const file = new File(["a"], "a.mp4", { type: "video/mp4" });
            vi.spyOn(file, "size", "get").mockReturnValue(
                MAX_VIDEO_SIZE_MB * BYTES_IN_MB + 1
            );
            const { uploadFile, getError } = renderComponent({});

            await uploadFile(file);

            const error = getError();
            expect(error).toBeInTheDocument();
            expect(error).toHaveTextContent(/video size/i);
        });

        it("should show error message if the file is of an unsupported format", async () => {
            const file = new File(["a"], "a.png", { type: "image/png" });
            const { uploadFile, getError } = renderComponent({});

            await uploadFile(file);

            const error = getError();
            expect(error).toBeInTheDocument();
            expect(error).toHaveTextContent(/file format/i);
        });

        it("should call onUploadCreated if upload creation succeeded", async () => {
            const file = new File(["a"], "a.mp4", { type: "video/mp4" });
            const { uploadFile, onUploadCreated } = renderComponent({});
            expect(onUploadCreated).not.toBeCalled();

            await uploadFile(file);

            expect(onUploadCreated).toBeCalledTimes(1);
        });

        it("should show error message if upload creation failed", async () => {
            const errorText = "file error 123";
            simulateError(BASE_URL + "/videos/uploads/", "post", {
                body: { file: [errorText] },
            });
            const file = new File(["a"], "a.mp4", { type: "video/mp4" });
            const { uploadFile, getError } = renderComponent({});

            await uploadFile(file);

            await waitFor(() => {
                const error = getError();
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(errorText);
            });
        });

        it("should show progress bar while file is uploading", async () => {
            simulateDelay(BASE_URL + "/videos/uploads/", "post");
            const file = new File(["a"], "a.mp4", { type: "video/mp4" });
            const { uploadFile, getProgressBar } = renderComponent({});

            await uploadFile(file);

            expect(getProgressBar(/uploading/i)).toBeInTheDocument();
        });

        it("should show progress bar while file is processing", async () => {
            const file = new File(["a"], "a.mp4", { type: "video/mp4" });
            const { uploadFile, getProgressBar } = renderComponent({});

            await uploadFile(file);

            expect(getProgressBar(/processing/i)).toBeInTheDocument();
        });

        it("should show the edit video modal when processing is done", async () => {
            const filename = "test123.mp4";
            const file = new File(["a"], filename, { type: "video/mp4" });
            const video = createVideo({});
            const { uploadFile, getEditVideoModal } = renderComponent({});
            await uploadFile(file);
            expect(getEditVideoModal().modal).not.toBeInTheDocument();

            db.upload.update({
                where: { filename: { equals: filename } },
                data: { is_done: true, video },
            });

            await waitFor(
                () => {
                    const { modal, titleInput } = getEditVideoModal();
                    expect(modal).toBeInTheDocument();
                    expect(titleInput).toHaveValue(video.title);
                },
                { timeout: 3000 }
            );
        });

        it("should call onVideoMutated when processing is done", async () => {
            const filename = "test123.mp4";
            const file = new File(["a"], filename, { type: "video/mp4" });
            const video = createVideo({});
            const { uploadFile, onVideoMutated } = renderComponent({});
            await uploadFile(file);
            expect(onVideoMutated).not.toBeCalled();

            db.upload.update({
                where: { filename: { equals: filename } },
                data: { is_done: true, video },
            });

            await waitFor(() => expect(onVideoMutated).toBeCalledTimes(1), {
                timeout: 3000,
            });
        });

        it("should call onVideoMutated when video is edited", async () => {
            const filename = "test123.mp4";
            const file = new File(["a"], filename, { type: "video/mp4" });
            const video = createVideo({});
            const { uploadFile, getEditVideoModal, onVideoMutated, user } =
                renderComponent({});
            await uploadFile(file);
            db.upload.update({
                where: { filename: { equals: filename } },
                data: { is_done: true, video },
            });
            await waitFor(
                () => expect(getEditVideoModal().modal).toBeInTheDocument(),
                { timeout: 3000 }
            );
            expect(onVideoMutated).toBeCalledTimes(1);

            await user.click(getEditVideoModal().saveButton!);

            expect(onVideoMutated).toBeCalledTimes(2);
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
    const onUploadCreated = vi.fn();
    const onVideoMutated = vi.fn();

    const { getLocation } = renderWithRouter(
        <UploadModal
            onClose={onClose}
            onUploadCreated={onUploadCreated}
            onVideoMutated={onVideoMutated}
            {...{ ...defaults, ...props }}
        />,
        useAppRoutes
    );

    const getModal = () =>
        screen.queryByRole("dialog", { name: /upload video/i });

    const getCloseButton = () =>
        within(getModal()!).getByRole("button", { name: /close/i });

    const getForm = () =>
        within(getModal()!).getByRole("form", { name: /select file/i });

    const getSelectFileButton = () =>
        within(getForm()).getByRole("button", { name: /select file/i });

    const getError = () => within(getForm()).getByRole("alert");

    const getProgressBar = (name: string | RegExp) =>
        within(getModal()!).queryByRole("progressbar", { name });

    const getEditVideoModal = () => {
        const modal = screen.queryByRole("dialog", { name: /edit video/i });
        const titleInputGroup =
            modal && within(modal).getByRole("group", { name: /title/i });
        return {
            modal,
            titleInput:
                titleInputGroup && within(titleInputGroup).getByRole("textbox"),
            saveButton:
                modal && within(modal).getByRole("button", { name: /save/i }),
        };
    };

    const user = userEvent.setup();

    const uploadFile = async (file: File) => {
        const input = getForm().querySelector('input[type="file"]');
        await act(async () => {
            fireEvent.change(input!, { target: { files: [file] } });
            await new Promise((r) => setTimeout(r, 0));
        });
    };

    return {
        getLocation,
        getModal,
        getCloseButton,
        getSelectFileButton,
        getError,
        getProgressBar,
        getEditVideoModal,
        user,
        uploadFile,
        onClose,
        onUploadCreated,
        onVideoMutated,
    };
}
