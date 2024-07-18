import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportModal from "../../../src/components/Player/InteractionButtons/MoreActionsMenu/ReportModal";
import Profile from "../../../src/entities/Profile";
import Video from "../../../src/entities/Video";
import { db, ReportReason } from "../../mocks/db";
import { BASE_URL } from "../../mocks/handlers/constants";
import {
    countReports,
    renderWithRouter,
    simulateError,
    simulateUnauthenticated,
} from "../../utils";

describe("ReportModal", () => {
    let video: Video;

    beforeEach(() => {
        const user = db.user.create();
        const profile = db.profile.create({ user }) as Profile;
        video = db.video.create({ profile }) as Video;
    });

    describe("initial state", () => {
        it("should not render modal while loading", () => {
            const { getModal } = renderComponent({ video });

            expect(getModal()).not.toBeInTheDocument();
        });

        it("should not render modal when isOpen prop is set to false", async () => {
            const { getModal, waitForModalToLoad } = renderComponent({
                video,
                isOpen: false,
            });

            await expect(() => waitForModalToLoad()).rejects.toThrowError();
            expect(getModal()).not.toBeInTheDocument();
        });

        it("should render modal when isOpen prop is set to true", async () => {
            const { getModal, waitForModalToLoad } = renderComponent({
                video,
                isOpen: true,
            });
            await waitForModalToLoad();

            expect(getModal()).toBeInTheDocument();
        });

        it("should render login request modal if user is not authenticated", async () => {
            simulateUnauthenticated();
            const { getLoginRequestModal } = renderComponent({
                video,
            });

            await waitFor(() =>
                expect(getLoginRequestModal()).toBeInTheDocument()
            );
        });
    });

    describe("close button", () => {
        it("should render the close button", async () => {
            const { getCloseButton, waitForModalToLoad } = renderComponent({
                video,
            });
            await waitForModalToLoad();

            expect(getCloseButton()).toBeInTheDocument();
        });

        it("should call onClose when the button is clicked", async () => {
            const { waitForModalToLoad, getCloseButton, onClose, user } =
                renderComponent({ video });
            await waitForModalToLoad();
            expect(onClose).not.toBeCalled();

            await user.click(getCloseButton()!);

            expect(onClose).toBeCalled();
        });
    });

    describe("radio options", () => {
        it("should render radio options", async () => {
            const { waitForModalToLoad, getRadioOptions } = renderComponent({
                video,
            });
            await waitForModalToLoad();
            const {
                sexRadioOption,
                violenceRadioOption,
                hateRadioOption,
                harassmentRadioOption,
                dangerRadioOption,
                misinformationRadioOption,
                childAbuseRadioOption,
                terrorismRadioOption,
                spamRadioOption,
            } = getRadioOptions();

            expect(sexRadioOption).toBeInTheDocument();
            expect(violenceRadioOption).toBeInTheDocument();
            expect(hateRadioOption).toBeInTheDocument();
            expect(harassmentRadioOption).toBeInTheDocument();
            expect(dangerRadioOption).toBeInTheDocument();
            expect(misinformationRadioOption).toBeInTheDocument();
            expect(childAbuseRadioOption).toBeInTheDocument();
            expect(terrorismRadioOption).toBeInTheDocument();
            expect(spamRadioOption).toBeInTheDocument();
        });
    });

    describe("report button", () => {
        it("should render the report button", async () => {
            const { waitForModalToLoad, getReportButton } = renderComponent({
                video,
            });
            await waitForModalToLoad();

            const reportButton = getReportButton();
            expect(reportButton).toBeInTheDocument();
            expect(reportButton).toHaveAttribute("disabled");
        });

        it("should enable the button when radio option is clicked", async () => {
            const {
                waitForModalToLoad,
                getRadioOptions,
                getReportButton,
                user,
            } = renderComponent({
                video,
            });
            await waitForModalToLoad();
            expect(getReportButton()).toHaveAttribute("disabled");

            await user.click(getRadioOptions().misinformationRadioOption!);

            expect(getReportButton()).not.toHaveAttribute("disabled");
        });
    });

    describe("creating report", () => {
        it.each<{ reason: ReportReason; radioOption: RadioOptionName }>([
            { reason: "sex", radioOption: "sexRadioOption" },
            { reason: "violence", radioOption: "violenceRadioOption" },
            { reason: "hate", radioOption: "hateRadioOption" },
            { reason: "harassment", radioOption: "harassmentRadioOption" },
            { reason: "danger", radioOption: "dangerRadioOption" },
            {
                reason: "misinformation",
                radioOption: "misinformationRadioOption",
            },
            { reason: "child_abuse", radioOption: "childAbuseRadioOption" },
            { reason: "terrorism", radioOption: "terrorismRadioOption" },
            { reason: "spam", radioOption: "spamRadioOption" },
        ])(
            "should create report with reason $reason when the report button is clicked after selecting $radioOption",
            async ({ reason, radioOption }) => {
                const {
                    waitForModalToLoad,
                    getRadioOptions,
                    getReportButton,
                    user,
                } = renderComponent({
                    video,
                });
                await waitForModalToLoad();
                const option = getRadioOptions()[radioOption]!;
                expect(countReports(video.id, reason)).toBe(0);

                await user.click(option);
                await user.click(getReportButton()!);

                expect(countReports(video.id, reason)).toBe(1);
            }
        );

        it("should show error message if report creation failed", async () => {
            simulateError(BASE_URL + "/videos/reports", "post", {});
            const {
                waitForModalToLoad,
                getRadioOptions,
                getReportButton,
                getErrorMessage,
                user,
            } = renderComponent({
                video,
            });
            await waitForModalToLoad();

            await user.click(getRadioOptions().misinformationRadioOption!);
            await user.click(getReportButton()!);

            const errorMessage = getErrorMessage();
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveTextContent(/something went wrong/i);
        });

        it("should show success message if report creation succeeded", async () => {
            const {
                waitForModalToLoad,
                getRadioOptions,
                getReportButton,
                getModal,
                getOkButton,
                user,
            } = renderComponent({
                video,
            });
            await waitForModalToLoad();

            await user.click(getRadioOptions().misinformationRadioOption!);
            await user.click(getReportButton()!);

            expect(getModal()).toHaveTextContent(/received your report/i);
            expect(getOkButton()).toBeInTheDocument();
        });
    });

    describe("success message", () => {
        it("should call onClose when the OK button is clicked", async () => {
            const {
                waitForModalToLoad,
                getRadioOptions,
                getReportButton,
                getOkButton,
                onClose,
                user,
            } = renderComponent({
                video,
            });
            await waitForModalToLoad();
            await user.click(getRadioOptions().misinformationRadioOption!);
            await user.click(getReportButton()!);
            expect(onClose).not.toBeCalled();

            await user.click(getOkButton()!);

            expect(onClose).toBeCalled();
        });
    });
});

interface Props {
    video: Video;
    isOpen?: boolean;
}

type RadioOptionName =
    | "sexRadioOption"
    | "violenceRadioOption"
    | "hateRadioOption"
    | "harassmentRadioOption"
    | "dangerRadioOption"
    | "misinformationRadioOption"
    | "childAbuseRadioOption"
    | "terrorismRadioOption"
    | "spamRadioOption";

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        isOpen: true,
    };

    const onClose = vi.fn();

    const { getLocation } = renderWithRouter(
        <ReportModal {...{ ...defaults, ...props }} onClose={onClose} />,
        useAppRoutes
    );

    const getModal = () => screen.queryByRole("dialog");
    const waitForModalToLoad = () =>
        waitFor(() => expect(getModal()).toBeInTheDocument());

    const getCloseButton = () =>
        within(getModal()!).queryByRole("button", { name: /close/i });

    const getRadioOptions = (): {
        [K in RadioOptionName]: HTMLElement | null;
    } => {
        const modal = getModal()!;
        return {
            sexRadioOption: within(modal).queryByRole("radio", {
                name: /sexual/i,
            }),
            violenceRadioOption: within(modal).queryByRole("radio", {
                name: /violent/i,
            }),
            hateRadioOption: within(modal).queryByRole("radio", {
                name: /hateful/i,
            }),
            harassmentRadioOption: within(modal).queryByRole("radio", {
                name: /harassment/i,
            }),
            dangerRadioOption: within(modal).queryByRole("radio", {
                name: /dangerous/i,
            }),
            misinformationRadioOption: within(modal).queryByRole("radio", {
                name: /misinformation/i,
            }),
            childAbuseRadioOption: within(modal).queryByRole("radio", {
                name: /child abuse/i,
            }),
            terrorismRadioOption: within(modal).queryByRole("radio", {
                name: /terrorism/i,
            }),
            spamRadioOption: within(modal).queryByRole("radio", {
                name: /spam/i,
            }),
        };
    };

    const getReportButton = () =>
        within(getModal()!).queryByRole("button", { name: /report/i });
    const getErrorMessage = () => within(getModal()!).queryByRole("alert");
    const getOkButton = () =>
        within(getModal()!).queryByRole("button", { name: "OK" });

    const getLoginRequestModal = () =>
        screen.queryByTestId("login-request-modal");

    const user = userEvent.setup();

    return {
        getLocation,
        getModal,
        waitForModalToLoad,
        getCloseButton,
        getRadioOptions,
        getReportButton,
        getErrorMessage,
        getOkButton,
        getLoginRequestModal,
        onClose,
        user,
    };
}
