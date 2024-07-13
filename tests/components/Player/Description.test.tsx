import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Description from "../../../src/components/Player/Description";
import Profile from "../../../src/entities/Profile";
import Video from "../../../src/entities/Video";
import { db } from "../../mocks/db";
import { renderWithRouter } from "../../utils";

describe("Description", () => {
    let video: Video;

    beforeEach(() => {
        const user = db.user.create();
        const profile = db.profile.create({ user }) as Profile;
        video = db.video.create({ profile }) as Video;
    });

    describe("close button", () => {
        it("should render the close button", () => {
            const { closeButton } = renderComponent({ video });

            expect(closeButton).toBeInTheDocument();
        });

        it("should call onClose whe the button is clicked", async () => {
            const { closeButton, onClose, user } = renderComponent({ video });
            expect(onClose).not.toBeCalled();

            await user.click(closeButton);

            expect(onClose).toBeCalled();
        });
    });

    describe("author's avatar and username", () => {
        it("should render avatar and username", () => {
            const { authorAvatar, authorUsername } = renderComponent({ video });

            expect(authorAvatar).toBeInTheDocument();
            expect(authorAvatar).toHaveAttribute("src", video.profile.avatar);
            expect(authorUsername).toBeInTheDocument();
            expect(authorUsername).toHaveTextContent(
                video.profile.user.username
            );
        });

        it("should redirect to the profile page when username is clicked", async () => {
            const { authorUsername, user, getLocation } = renderComponent({
                video,
            });

            await user.click(authorUsername);

            expect(getLocation().pathname).toBe(
                `/users/${video.profile.user.username}`
            );
        });

        it("should redirect to the profile page when avatar is clicked", async () => {
            const { authorAvatar, user, getLocation } = renderComponent({
                video,
            });

            await user.click(authorAvatar);

            expect(getLocation().pathname).toBe(
                `/users/${video.profile.user.username}`
            );
        });
    });

    describe("video data", () => {
        it("should render the video title", () => {
            const { videoTitle } = renderComponent({ video });

            expect(videoTitle).toBeInTheDocument();
            expect(videoTitle).toHaveTextContent(video.title);
        });

        it("should render the like count", () => {
            const { likeCount } = renderComponent({ video });

            expect(likeCount).toBeInTheDocument();
            expect(
                within(likeCount).getByText(video.like_count)
            ).toBeInTheDocument();
            expect(within(likeCount).getByText(/likes/i)).toBeInTheDocument();
        });

        it("should render the view count", () => {
            const { viewCount } = renderComponent({ video });

            expect(viewCount).toBeInTheDocument();
            expect(
                within(viewCount).getByText(video.view_count)
            ).toBeInTheDocument();
            expect(within(viewCount).getByText(/views/i)).toBeInTheDocument();
        });

        it("should render the upload date correctly", () => {
            video = db.video.create({
                ...video,
                id: undefined,
                upload_date: new Date(2024, 0, 24, 1, 1, 1),
            }) as Video;

            const { uploadDate } = renderComponent({ video });

            expect(uploadDate).toBeInTheDocument();
            expect(within(uploadDate).getByText(/Jan 24/i)).toBeInTheDocument();
            expect(within(uploadDate).getByText(/2024/i)).toBeInTheDocument();
        });

        it("should render the video description", () => {
            const { videoDescription } = renderComponent({ video });

            expect(videoDescription).toBeInTheDocument();
            expect(videoDescription).toHaveTextContent(video.description);
        });
    });
});

interface Props {
    video: Video;
}

function renderComponent(props: Props) {
    const onClose = vi.fn();

    const { getLocation } = renderWithRouter(
        <Description {...props} onClose={onClose} />
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    const videoTitle = screen.getByLabelText(/title/i);
    const authorAvatar = screen.getByRole("img", { name: /avatar/i });
    const authorUsername = screen.getByLabelText(/username/i);
    const likeCount = screen.getByLabelText(/likes/i);
    const viewCount = screen.getByLabelText(/views/i);
    const uploadDate = screen.getByLabelText(/upload date/i);
    const videoDescription = screen.getByLabelText(/description/i);

    const user = userEvent.setup();

    return {
        getLocation,
        closeButton,
        videoTitle,
        authorAvatar,
        authorUsername,
        likeCount,
        viewCount,
        uploadDate,
        videoDescription,
        onClose,
        user,
    };
}
