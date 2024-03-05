import {
    Button,
    HStack,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    StackProps,
    Text,
    VStack,
    useClipboard,
} from "@chakra-ui/react";
import { isMobile } from "react-device-detect";
import { CiCircleMore } from "react-icons/ci";
import {
    EmailIcon,
    EmailShareButton,
    FacebookIcon,
    FacebookShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    PinterestIcon,
    PinterestShareButton,
    RedditIcon,
    RedditShareButton,
    TumblrIcon,
    TumblrShareButton,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton,
    XIcon,
} from "react-share";
import Video from "../../../../entities/Video";

interface Props {
    video: Video;
    isOpen: boolean;
    onClose: () => void;
}

function ShareModal({ video, isOpen, onClose }: Props) {
    const url = window.origin + "/videos/" + video.id;

    const { onCopy, hasCopied } = useClipboard(url, 2000);

    const buttonProps: StackProps = {
        spacing: 2,
        padding: 2,
        borderRadius: "3px",
        _hover: {
            backgroundColor: "whiteAlpha.200",
            cursor: "pointer",
        },
    };

    const iconProps = {
        size: 60,
        round: true,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Share</ModalHeader>
                <ModalCloseButton />
                <ModalBody paddingX={2}>
                    <SimpleGrid columns={{ base: 3, sm: 4 }} gap={2}>
                        <FacebookShareButton url={url}>
                            <VStack {...buttonProps}>
                                <FacebookIcon {...iconProps} />
                                <Text fontSize="xs">Facebook</Text>
                            </VStack>
                        </FacebookShareButton>
                        <WhatsappShareButton url={url} title={video.title}>
                            <VStack {...buttonProps}>
                                <WhatsappIcon {...iconProps} />
                                <Text fontSize="xs">WhatsApp</Text>
                            </VStack>
                        </WhatsappShareButton>
                        <EmailShareButton url={url} subject={video.title}>
                            <VStack {...buttonProps}>
                                <EmailIcon {...iconProps} />
                                <Text fontSize="xs">Email</Text>
                            </VStack>
                        </EmailShareButton>
                        <TwitterShareButton url={url} title={video.title}>
                            <VStack {...buttonProps}>
                                <XIcon {...iconProps} />
                                <Text fontSize="xs">X</Text>
                            </VStack>
                        </TwitterShareButton>
                        <PinterestShareButton
                            url={url}
                            media={video.thumbnail}
                            description={video.title}
                        >
                            <VStack {...buttonProps}>
                                <PinterestIcon {...iconProps} />
                                <Text fontSize="xs">Pinterest</Text>
                            </VStack>
                        </PinterestShareButton>
                        <RedditShareButton url={url} title={video.title}>
                            <VStack {...buttonProps}>
                                <RedditIcon {...iconProps} />
                                <Text fontSize="xs">Reddit</Text>
                            </VStack>
                        </RedditShareButton>
                        <LinkedinShareButton url={url} title={video.title}>
                            <VStack {...buttonProps}>
                                <LinkedinIcon {...iconProps} />
                                <Text fontSize="xs">LinkedIn</Text>
                            </VStack>
                        </LinkedinShareButton>
                        <TumblrShareButton url={url} title={video.title}>
                            <VStack {...buttonProps}>
                                <TumblrIcon {...iconProps} />
                                <Text fontSize="xs">Tumblr</Text>
                            </VStack>
                        </TumblrShareButton>
                        {isMobile && (
                            <VStack
                                as="button"
                                {...buttonProps}
                                onClick={() =>
                                    navigator.share({
                                        url,
                                        title: video.title,
                                    })
                                }
                            >
                                <Icon
                                    as={CiCircleMore}
                                    boxSize={`calc(${iconProps.size}px / 83 * 100)`}
                                />
                                <Text fontSize="xs">More</Text>
                            </VStack>
                        )}
                    </SimpleGrid>
                </ModalBody>
                <ModalFooter>
                    <HStack width="100%">
                        <Input value={url} readOnly />
                        <Button
                            onClick={onCopy}
                            colorScheme={hasCopied ? "green" : "blue"}
                            minWidth="4.5rem"
                        >
                            {hasCopied ? "Copied" : "Copy"}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ShareModal;
