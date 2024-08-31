import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import DeleteVideoDialog from "../../src/components/VideoTable/DeleteVideoDialog";
import Video from "../../src/entities/Video";
import { db, getOwnProfile } from "../mocks/db";
import { BASE_URL } from "../mocks/handlers/constants";
import { createVideo, renderWithRouter, simulateError } from "../utils";

describe("DeleteVideoDialog", () => {
    let video: Video;

    beforeEach(() => {
        video = createVideo({ profile: getOwnProfile() });
    });

    describe("initial state", () => {
        it("should not render modal when isOpen prop is set to false", () => {
            const { getDialog } = renderComponent({ video, isOpen: false });

            expect(getDialog()).not.toBeInTheDocument();
        });

        it("should render modal when isOpen prop is set to true", () => {
            const { getDialog } = renderComponent({ video, isOpen: true });

            expect(getDialog()).toBeInTheDocument();
        });
    });

    describe("content", () => {
        it("should render the thumbnail", () => {
            const { getThumbnail } = renderComponent({ video });

            const thumbnail = getThumbnail();
            expect(thumbnail).toBeInTheDocument();
            expect(thumbnail).toHaveAttribute("src", video.thumbnail);
        });

        it("should render the title", () => {
            const { getTitle } = renderComponent({ video });

            const title = getTitle();
            expect(title).toBeInTheDocument();
            expect(title).toHaveTextContent(video.title);
        });

        it("should render the upload date", () => {
            const video = createVideo({
                profile: getOwnProfile(),
                uploadDate: new Date(2024, 0, 24, 1, 1, 0),
            });
            const { getUploadDate } = renderComponent({ video });

            const uploadDate = getUploadDate();
            expect(uploadDate).toBeInTheDocument();
            expect(uploadDate).toHaveTextContent(/Jan 24, 2024/i);
        });

        it("should render the view count", () => {
            const { getViewCount } = renderComponent({ video });

            const viewCount = getViewCount();
            expect(viewCount).toBeInTheDocument();
            expect(viewCount).toHaveTextContent(video.view_count.toString());
        });
    });

    describe("cancel button", () => {
        it("should render the cancel button", () => {
            const { getCancelButton } = renderComponent({ video });

            expect(getCancelButton()).toBeInTheDocument();
        });

        it("should call onClose when the button is clicked", async () => {
            const { getCancelButton, onClose, user } = renderComponent({
                video,
            });
            expect(onClose).not.toBeCalled();

            await user.click(getCancelButton());

            expect(onClose).toBeCalled();
        });

        it("should not delete video when the button is clicked", async () => {
            const { getCancelButton, user } = renderComponent({ video });
            expect(
                db.video.count({ where: { id: { equals: video.id } } })
            ).toBe(1);

            await user.click(getCancelButton());

            expect(
                db.video.count({ where: { id: { equals: video.id } } })
            ).toBe(1);
        });
    });

    describe("delete button", () => {
        it("should render the delete button", () => {
            const { getDeleteButton } = renderComponent({ video });

            expect(getDeleteButton()).toBeInTheDocument();
        });

        it("should delete video when the button is clicked", async () => {
            const { getDeleteButton, user } = renderComponent({ video });
            expect(
                db.video.count({ where: { id: { equals: video.id } } })
            ).toBe(1);

            await user.click(getDeleteButton());

            expect(
                db.video.count({ where: { id: { equals: video.id } } })
            ).toBe(0);
        });
    });

    describe("deleting video", () => {
        it("should call onClose if deletion succeeded", async () => {
            const { getDeleteButton, user, onClose } = renderComponent({
                video,
            });
            expect(onClose).not.toBeCalled();

            await user.click(getDeleteButton());

            expect(onClose).toBeCalled();
        });

        it("should call onVideoDeleted if deletion succeeded", async () => {
            const { getDeleteButton, user, onVideoDeleted } = renderComponent({
                video,
            });
            expect(onVideoDeleted).not.toBeCalled();

            await user.click(getDeleteButton());

            expect(onVideoDeleted).toBeCalledTimes(1);
        });

        it("shoud show error message if deletion failed", async () => {
            simulateError(BASE_URL + `/videos/videos/${video.id}`, "delete");
            const { getDeleteButton, user, getError } = renderComponent({
                video,
            });
            expect(getError()).not.toBeInTheDocument();

            await user.click(getDeleteButton());

            const error = getError();
            expect(error).toBeInTheDocument();
            expect(error).toHaveTextContent(/something went wrong/i);
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
    const onVideoDeleted = vi.fn();

    const { getLocation } = renderWithRouter(
        <DeleteVideoDialog
            onClose={onClose}
            onVideoDeleted={onVideoDeleted}
            {...{ ...defaults, ...props }}
        />,
        useAppRoutes
    );

    const getDialog = () =>
        screen.queryByRole("alertdialog", { name: /delete this video/i });

    const getThumbnail = () =>
        within(getDialog()!).getByRole("img", { name: /thumbnail/i });
    const getTitle = () => within(getDialog()!).getByLabelText(/title/i);
    const getUploadDate = () =>
        within(getDialog()!).getByLabelText(/upload date/i);
    const getViewCount = () => within(getDialog()!).getByLabelText(/views/i);

    const getCancelButton = () =>
        within(getDialog()!).getByRole("button", { name: /cancel/i });
    const getDeleteButton = () =>
        within(getDialog()!).getByRole("button", { name: /delete/i });

    const getError = () => within(getDialog()!).queryByRole("alert");

    const user = userEvent.setup();

    return {
        getLocation,
        getDialog,
        getThumbnail,
        getTitle,
        getUploadDate,
        getViewCount,
        getCancelButton,
        getDeleteButton,
        getError,
        user,
        onClose,
        onVideoDeleted,
    };
}
