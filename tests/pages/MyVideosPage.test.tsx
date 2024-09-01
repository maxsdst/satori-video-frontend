import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { navigateTo, simulateUnauthenticated } from "../utils";

describe("MyVideosPage", () => {
    describe("loading", () => {
        it("should show spinner while loading", () => {
            const { getSpinner } = navigateToPage("/my_videos");

            expect(getSpinner()).toBeInTheDocument();
        });

        it("should hide spinner after loading is complete", async () => {
            const { waitForDataToLoad, getSpinner } =
                navigateToPage("/my_videos");
            await waitForDataToLoad();

            expect(getSpinner()).not.toBeInTheDocument();
        });
    });

    describe("unauthenticated", () => {
        describe("/my_videos", () => {
            it("should redirect to '/login' if user is unauthenticated", async () => {
                simulateUnauthenticated();
                const { waitForDataToLoad, getLocation } =
                    navigateToPage("/my_videos");
                expect(getLocation().pathname).not.toBe("/login");

                await waitForDataToLoad();

                expect(getLocation().pathname).toBe("/login");
            });
        });

        describe("/uploads", () => {
            it("should redirect to '/login' if user is unauthenticated", async () => {
                simulateUnauthenticated();
                const { waitForDataToLoad, getLocation } =
                    navigateToPage("/uploads");
                expect(getLocation().pathname).not.toBe("/login");

                await waitForDataToLoad();

                expect(getLocation().pathname).toBe("/login");
            });
        });
    });

    describe("tabs", () => {
        it("should render tabs", async () => {
            const { waitForDataToLoad, getTabs } = navigateToPage("/my_videos");
            await waitForDataToLoad();

            const { videosTab, uploadsTab } = getTabs();
            expect(videosTab).toBeInTheDocument();
            expect(uploadsTab).toBeInTheDocument();
        });

        it("should have the videos tab active initially if pathname is '/my_videos'", async () => {
            const { waitForDataToLoad, getVideosTabPanel, getUploadsTabPanel } =
                navigateToPage("/my_videos");
            await waitForDataToLoad();

            expect(getVideosTabPanel().panel).toBeInTheDocument();
            expect(getUploadsTabPanel().panel).not.toBeInTheDocument();
        });

        it("should have the uploads tab active initially if pathname is '/uploads'", async () => {
            const { waitForDataToLoad, getVideosTabPanel, getUploadsTabPanel } =
                navigateToPage("/uploads");
            await waitForDataToLoad();

            expect(getVideosTabPanel().panel).not.toBeInTheDocument();
            expect(getUploadsTabPanel().panel).toBeInTheDocument();
        });

        it("should navigate to '/my_videos' and show the videos tab panel when the videos tab is clicked", async () => {
            const {
                waitForDataToLoad,
                getTabs,
                getVideosTabPanel,
                getLocation,
                user,
            } = navigateToPage("/uploads");
            await waitForDataToLoad();
            expect(getLocation().pathname).not.toBe("/my_videos");
            expect(getVideosTabPanel().panel).not.toBeInTheDocument();

            await user.click(getTabs().videosTab!);

            expect(getLocation().pathname).toBe("/my_videos");
            expect(getVideosTabPanel().panel).toBeInTheDocument();
        });

        it("should navigate to '/uploads' and show the uploads tab panel when the uploads tab is clicked", async () => {
            const {
                waitForDataToLoad,
                getTabs,
                getUploadsTabPanel,
                getLocation,
                user,
            } = navigateToPage("/my_videos");
            await waitForDataToLoad();
            expect(getLocation().pathname).not.toBe("/uploads");
            expect(getUploadsTabPanel().panel).not.toBeInTheDocument();

            await user.click(getTabs().uploadsTab!);

            expect(getLocation().pathname).toBe("/uploads");
            expect(getUploadsTabPanel().panel).toBeInTheDocument();
        });
    });

    describe("videos tab", () => {
        it("should render the video table", async () => {
            const { waitForDataToLoad, getVideosTabPanel } =
                navigateToPage("/my_videos");
            await waitForDataToLoad();

            expect(getVideosTabPanel().videoTable).toBeInTheDocument();
        });
    });

    describe("uploads tab", () => {
        it("should render the upload table", async () => {
            const { waitForDataToLoad, getUploadsTabPanel } =
                navigateToPage("/uploads");
            await waitForDataToLoad();

            expect(getUploadsTabPanel().uploadTable).toBeInTheDocument();
        });
    });

    describe("upload modal", () => {
        it("should render the upload modal if pathname is '/uploads' and URL has 'upload' param", async () => {
            const { waitForDataToLoad, getUploadModal } = navigateToPage(
                "/uploads",
                { upload: "" }
            );
            await waitForDataToLoad();

            expect(getUploadModal()).toBeInTheDocument();
        });

        it("should not render the upload modal if URL has no 'upload' param", async () => {
            const { waitForDataToLoad, getUploadModal } = navigateToPage(
                "/uploads",
                {}
            );
            await waitForDataToLoad();

            expect(getUploadModal()).not.toBeInTheDocument();
        });
    });
});

function navigateToPage(
    pathname: "/my_videos" | "/uploads",
    searchParams?: Record<string, string>
) {
    const { getLocation } = navigateTo(pathname, { searchParams });

    const getSpinner = () => screen.queryByRole("progressbar");

    const getTabs = () => {
        const tablist = screen.queryByRole("tablist");
        return {
            videosTab:
                tablist &&
                within(tablist).getByRole("tab", { name: /videos/i }),
            uploadsTab:
                tablist &&
                within(tablist).getByRole("tab", { name: /uploads/i }),
        };
    };

    const getVideosTabPanel = () => {
        const panel = screen.queryByRole("tabpanel", { name: /videos/i });
        return {
            panel,
            videoTable: panel && within(panel).queryByTestId("video-table"),
        };
    };

    const getUploadsTabPanel = () => {
        const panel = screen.queryByRole("tabpanel", { name: /uploads/i });
        return {
            panel,
            uploadTable: panel && within(panel).queryByTestId("upload-table"),
        };
    };

    const getUploadModal = () =>
        screen.queryByRole("dialog", { name: /upload video/i });

    const user = userEvent.setup();

    const waitForDataToLoad = () =>
        waitFor(() => expect(getSpinner()).not.toBeInTheDocument(), {
            timeout: 5000,
        });

    return {
        getLocation,
        getSpinner,
        getTabs,
        getVideosTabPanel,
        getUploadsTabPanel,
        getUploadModal,
        user,
        waitForDataToLoad,
    };
}
