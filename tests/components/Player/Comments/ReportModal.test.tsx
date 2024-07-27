import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportModal from "../../../../src/components/Player/Comments/Item/ActionMenu/ReportModal";
import Comment from "../../../../src/entities/Comment";
import { CommentReportReason } from "../../../mocks/db";
import { BASE_URL } from "../../../mocks/handlers/constants";
import {
    countCommentReports,
    createComment,
    renderWithRouter,
    simulateError,
    simulateUnauthenticated,
} from "../../../utils";

describe("ReportModal", () => {
    let comment: Comment;

    beforeEach(() => {
        comment = createComment({});
    });

    describe("initial state", () => {
        it("should not render modal while loading", () => {
            const { getModal } = renderComponent({ comment });

            expect(getModal()).not.toBeInTheDocument();
        });

        it("should not render modal when isOpen prop is set to false", async () => {
            const { getModal, waitForModalToLoad } = renderComponent({
                comment,
                isOpen: false,
            });

            await expect(() => waitForModalToLoad()).rejects.toThrowError();
            expect(getModal()).not.toBeInTheDocument();
        });

        it("should render modal when isOpen prop is set to true", async () => {
            const { getModal, waitForModalToLoad } = renderComponent({
                comment,
                isOpen: true,
            });
            await waitForModalToLoad();

            expect(getModal()).toBeInTheDocument();
        });

        it("should render login request modal if user is not authenticated", async () => {
            simulateUnauthenticated();
            const { getLoginRequestModal } = renderComponent({
                comment,
            });

            await waitFor(() =>
                expect(getLoginRequestModal()).toBeInTheDocument()
            );
        });
    });

    describe("close button", () => {
        it("should render the close button", async () => {
            const { getCloseButton, waitForModalToLoad } = renderComponent({
                comment,
            });
            await waitForModalToLoad();

            expect(getCloseButton()).toBeInTheDocument();
        });

        it("should call onClose when the close button is clicked", async () => {
            const { waitForModalToLoad, getCloseButton, onClose, user } =
                renderComponent({ comment });
            await waitForModalToLoad();
            expect(onClose).not.toBeCalled();

            await user.click(getCloseButton()!);

            expect(onClose).toBeCalled();
        });
    });

    describe("radio options", () => {
        it("should render radio options", async () => {
            const { waitForModalToLoad, getRadioOptions } = renderComponent({
                comment,
            });
            await waitForModalToLoad();
            const {
                spamRadioOption,
                pornographyRadioOption,
                childAbuseRadioOption,
                hateSpeechRadioOption,
                terrorismRadioOption,
                harassmentRadioOption,
                suicideRadioOption,
                misinformationRadioOption,
            } = getRadioOptions();

            expect(spamRadioOption).toBeInTheDocument();
            expect(pornographyRadioOption).toBeInTheDocument();
            expect(childAbuseRadioOption).toBeInTheDocument();
            expect(hateSpeechRadioOption).toBeInTheDocument();
            expect(terrorismRadioOption).toBeInTheDocument();
            expect(harassmentRadioOption).toBeInTheDocument();
            expect(suicideRadioOption).toBeInTheDocument();
            expect(misinformationRadioOption).toBeInTheDocument();
        });
    });

    describe("report button", () => {
        it("should render the report button", async () => {
            const { waitForModalToLoad, getReportButton } = renderComponent({
                comment,
            });
            await waitForModalToLoad();

            const reportButton = getReportButton();
            expect(reportButton).toBeInTheDocument();
            expect(reportButton).toHaveAttribute("disabled");
        });

        it("should enable the report button when radio option is clicked", async () => {
            const {
                waitForModalToLoad,
                getRadioOptions,
                getReportButton,
                user,
            } = renderComponent({
                comment,
            });
            await waitForModalToLoad();
            expect(getReportButton()).toHaveAttribute("disabled");

            await user.click(getRadioOptions().misinformationRadioOption!);

            expect(getReportButton()).not.toHaveAttribute("disabled");
        });
    });

    describe("creating report", () => {
        it.each<{ reason: CommentReportReason; radioOption: RadioOptionName }>([
            { reason: "spam", radioOption: "spamRadioOption" },
            { reason: "pornography", radioOption: "pornographyRadioOption" },
            { reason: "child_abuse", radioOption: "childAbuseRadioOption" },
            { reason: "hate_speech", radioOption: "hateSpeechRadioOption" },
            { reason: "terrorism", radioOption: "terrorismRadioOption" },
            { reason: "harassment", radioOption: "harassmentRadioOption" },
            { reason: "suicide", radioOption: "suicideRadioOption" },
            {
                reason: "misinformation",
                radioOption: "misinformationRadioOption",
            },
        ])(
            "should create report with reason $reason when the report button is clicked after selecting $radioOption",
            async ({ reason, radioOption }) => {
                const {
                    waitForModalToLoad,
                    getRadioOptions,
                    getReportButton,
                    user,
                } = renderComponent({
                    comment,
                });
                await waitForModalToLoad();
                const option = getRadioOptions()[radioOption]!;
                expect(countCommentReports(comment.id, reason)).toBe(0);

                await user.click(option);
                await user.click(getReportButton()!);

                expect(countCommentReports(comment.id, reason)).toBe(1);
            }
        );

        it("should show error message if report creation failed", async () => {
            simulateError(BASE_URL + "/videos/comment_reports", "post", {});
            const {
                waitForModalToLoad,
                getRadioOptions,
                getReportButton,
                getErrorMessage,
                user,
            } = renderComponent({
                comment,
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
                comment,
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
                comment,
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
    comment: Comment;
    isOpen?: boolean;
}

type RadioOptionName =
    | "spamRadioOption"
    | "pornographyRadioOption"
    | "childAbuseRadioOption"
    | "hateSpeechRadioOption"
    | "terrorismRadioOption"
    | "harassmentRadioOption"
    | "suicideRadioOption"
    | "misinformationRadioOption";

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
            spamRadioOption: within(modal).queryByRole("radio", {
                name: /spam/i,
            }),
            pornographyRadioOption: within(modal).queryByRole("radio", {
                name: /pornography/i,
            }),
            childAbuseRadioOption: within(modal).queryByRole("radio", {
                name: /child abuse/i,
            }),
            hateSpeechRadioOption: within(modal).queryByRole("radio", {
                name: /hate speech/i,
            }),
            terrorismRadioOption: within(modal).queryByRole("radio", {
                name: /terrorism/i,
            }),
            harassmentRadioOption: within(modal).queryByRole("radio", {
                name: /harassment/i,
            }),
            suicideRadioOption: within(modal).queryByRole("radio", {
                name: /suicide/i,
            }),
            misinformationRadioOption: within(modal).queryByRole("radio", {
                name: /misinformation/i,
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
