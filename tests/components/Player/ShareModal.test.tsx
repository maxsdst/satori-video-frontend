import * as chakraUi from "@chakra-ui/react";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareModal from "../../../src/components/Player/InteractionButtons/MoreActionsMenu/ShareModal";
import Profile from "../../../src/entities/Profile";
import Video from "../../../src/entities/Video";
import { db } from "../../mocks/db";
import { renderWithRouter, simulateMobileDevice } from "../../utils";

describe("ShareModal", () => {
    let video: Video;

    beforeEach(() => {
        const user = db.user.create();
        const profile = db.profile.create({ user }) as Profile;
        video = db.video.create({ profile }) as Video;
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

            await user.click(getCloseButton()!);

            expect(onClose).toBeCalled();
        });
    });

    describe("share buttons", () => {
        it("should render share buttons", () => {
            const { getShareButtons } = renderComponent({ video });

            const {
                facebookButton,
                whatsappButton,
                emailButton,
                xButton,
                pinterestButton,
                redditButton,
                linkedinButton,
                tumblrButton,
            } = getShareButtons();
            expect(facebookButton).toBeInTheDocument();
            expect(whatsappButton).toBeInTheDocument();
            expect(emailButton).toBeInTheDocument();
            expect(xButton).toBeInTheDocument();
            expect(pinterestButton).toBeInTheDocument();
            expect(redditButton).toBeInTheDocument();
            expect(linkedinButton).toBeInTheDocument();
            expect(tumblrButton).toBeInTheDocument();
        });

        it.each<{
            buttonName: ShareButtonName;
            url: {
                host: string;
                pathname: string;
                validateSearchParams: (
                    searchParams: URLSearchParams,
                    videoData: {
                        link: string;
                        title: string;
                        thumbnail: string;
                    }
                ) => void;
            };
        }>([
            {
                buttonName: "facebookButton",
                url: {
                    host: "www.facebook.com",
                    pathname: "/sharer/sharer.php",
                    validateSearchParams: (params, { link }) => {
                        expect(params.get("u")).toBe(link);
                    },
                },
            },
            {
                buttonName: "whatsappButton",
                url: {
                    host: "web.whatsapp.com",
                    pathname: "/send",
                    validateSearchParams: (params, { link, title }) => {
                        expect(params.get("text")).toBe(`${title} ${link}`);
                    },
                },
            },
            {
                buttonName: "xButton",
                url: {
                    host: "twitter.com",
                    pathname: "/intent/tweet",
                    validateSearchParams: (params, { link, title }) => {
                        expect(params.get("url")).toBe(link);
                        expect(params.get("text")).toBe(title);
                    },
                },
            },
            {
                buttonName: "pinterestButton",
                url: {
                    host: "pinterest.com",
                    pathname: "/pin/create/button/",
                    validateSearchParams: (
                        params,
                        { link, title, thumbnail }
                    ) => {
                        expect(params.get("url")).toBe(link);
                        expect(params.get("description")).toBe(title);
                        expect(params.get("media")).toBe(thumbnail);
                    },
                },
            },
            {
                buttonName: "redditButton",
                url: {
                    host: "www.reddit.com",
                    pathname: "/submit",
                    validateSearchParams: (params, { link, title }) => {
                        expect(params.get("url")).toBe(link);
                        expect(params.get("title")).toBe(title);
                    },
                },
            },
            {
                buttonName: "linkedinButton",
                url: {
                    host: "linkedin.com",
                    pathname: "/shareArticle",
                    validateSearchParams: (params, { link, title }) => {
                        expect(params.get("url")).toBe(link);
                        expect(params.get("title")).toBe(title);
                        expect(params.get("mini")).toBe("true");
                    },
                },
            },
            {
                buttonName: "tumblrButton",
                url: {
                    host: "www.tumblr.com",
                    pathname: "/widgets/share/tool",
                    validateSearchParams: (params, { link, title }) => {
                        expect(params.get("canonicalUrl")).toBe(link);
                        expect(params.get("title")).toBe(title);
                        expect(params.get("posttype")).toBe("link");
                    },
                },
            },
        ])(
            "should call window.open with correct URL when $buttonName is clicked",
            async ({ buttonName, url }) => {
                const { getShareButtons, user } = renderComponent({ video });
                const button = getShareButtons()[buttonName]!;
                const windowOpen = vi
                    .spyOn(window, "open")
                    .mockImplementation(vi.fn());

                await user.click(button);

                expect(windowOpen).toHaveBeenCalledTimes(1);
                const openedUrl = new URL(
                    windowOpen.mock.lastCall?.[0] as string
                );
                expect(openedUrl.host).toBe(url.host);
                expect(openedUrl.pathname).toBe(url.pathname);
                url.validateSearchParams(openedUrl.searchParams, {
                    link: window.location.origin + "/videos/" + video.id,
                    title: video.title,
                    thumbnail: video.thumbnail,
                });
            }
        );

        it("should set window.location.href to the correct link when the email button is clicked", async () => {
            const { getShareButtons, user } = renderComponent({ video });
            const { emailButton } = getShareButtons();
            const locationHrefSetter = vi
                .spyOn(window.location, "href", "set")
                .mockImplementation(vi.fn());

            await user.click(emailButton!);

            expect(locationHrefSetter).toBeCalled();
            const url = new URL(
                locationHrefSetter.mock.lastCall?.[0] as string
            );
            expect(url.protocol).toBe("mailto:");
            expect(url.searchParams.get("subject")).toBe(video.title);
            expect(url.searchParams.get("body")).toBe(
                window.location.origin + "/videos/" + video.id
            );
        });
    });

    describe("more button", () => {
        it("should render the more button on mobile devices", async () => {
            await simulateMobileDevice(() => {
                const { getMoreButton } = renderComponent({ video });

                expect(getMoreButton()).toBeInTheDocument();
            });
        });

        it("should not render the more button on non-mobile devices", () => {
            const { getMoreButton } = renderComponent({ video });

            expect(getMoreButton()).not.toBeInTheDocument();
        });

        it("should call window.navigator.share with correct value when the more button is clicked", async () => {
            await simulateMobileDevice(async () => {
                const { getMoreButton, user } = renderComponent({ video });
                const moreButton = getMoreButton();
                const navigatorShare = vi.spyOn(window.navigator, "share");

                await user.click(moreButton!);

                expect(navigatorShare).toHaveBeenCalledWith({
                    url: window.location.origin + "/videos/" + video.id,
                    title: video.title,
                });
            });
        });
    });

    describe("copy link section", () => {
        it("should render the input containing video link", () => {
            const { getVideoLinkInput } = renderComponent({ video });

            const videoLinkInput = getVideoLinkInput();
            expect(videoLinkInput).toBeInTheDocument();
            expect(videoLinkInput).toHaveAttribute("readOnly");
            expect(videoLinkInput).toHaveValue(
                window.location.origin + "/videos/" + video.id
            );
        });

        it("should render the copy link button", () => {
            const { getCopyLinkButton } = renderComponent({ video });

            expect(getCopyLinkButton()).toBeInTheDocument();
        });

        it("should copy the video link to clipboard when the copy link button is clicked", async () => {
            const onCopy = vi.fn();
            const setValue = vi.fn();
            const useClipboard = vi
                .spyOn(chakraUi, "useClipboard")
                .mockReturnValue({
                    value: "",
                    setValue,
                    onCopy,
                    hasCopied: false,
                });
            const { getCopyLinkButton, user } = renderComponent({ video });

            await user.click(getCopyLinkButton()!);

            expect(useClipboard.mock.calls[0][0]).toBe(
                window.location.origin + "/videos/" + video.id
            );
            expect(setValue).not.toBeCalled();
            expect(onCopy).toBeCalled();
        });
    });
});

interface Props {
    video: Video;
    isOpen?: boolean;
}

type ShareButtonName =
    | "facebookButton"
    | "whatsappButton"
    | "emailButton"
    | "xButton"
    | "pinterestButton"
    | "redditButton"
    | "linkedinButton"
    | "tumblrButton";

function renderComponent(props: Props, useAppRoutes?: boolean) {
    const defaults = {
        isOpen: true,
    };

    const onClose = vi.fn();

    const { getLocation } = renderWithRouter(
        <ShareModal {...{ ...defaults, ...props }} onClose={onClose} />,
        useAppRoutes
    );

    const getModal = () => screen.queryByRole("dialog");
    const getCloseButton = () =>
        within(getModal()!).queryByRole("button", { name: /close/i });

    const getShareButtons = (): {
        [K in ShareButtonName]: HTMLElement | null;
    } => {
        const modal = getModal()!;
        return {
            facebookButton: within(modal).queryByRole("button", {
                name: /Facebook/i,
            }),
            whatsappButton: within(modal).queryByRole("button", {
                name: /WhatsApp/i,
            }),
            emailButton: within(modal).queryByRole("button", {
                name: /Email/i,
            }),
            xButton: within(modal).queryByRole("button", {
                name: "X",
            }),
            pinterestButton: within(modal).queryByRole("button", {
                name: /Pinterest/i,
            }),
            redditButton: within(modal).queryByRole("button", {
                name: /Reddit/i,
            }),
            linkedinButton: within(modal).queryByRole("button", {
                name: /LinkedIn/i,
            }),
            tumblrButton: within(modal).queryByRole("button", {
                name: /Tumblr/i,
            }),
        };
    };

    const getMoreButton = () =>
        within(getModal()!).queryByRole("button", { name: /more/i });

    const getVideoLinkInput = () =>
        within(getModal()!).queryByRole("textbox", { name: /video link/i });
    const getCopyLinkButton = () =>
        within(getModal()!).queryByRole("button", { name: /copy link/i });

    const user = userEvent.setup();

    return {
        getLocation,
        getModal,
        getCloseButton,
        getShareButtons,
        getMoreButton,
        getVideoLinkInput,
        getCopyLinkButton,
        onClose,
        user,
    };
}
