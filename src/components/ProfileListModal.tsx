import {
    Avatar,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    VStack,
} from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router-dom";
import Profile from "../entities/Profile";

interface Props {
    profiles: Profile[];
    hasMore: boolean;
    onFetchMore: () => void;
    header: string;
    isOpen: boolean;
    onClose: () => void;
}

function ProfileListModal({
    profiles,
    hasMore,
    onFetchMore,
    header,
    isOpen,
    onClose,
}: Props) {
    const [scrollableTarget, setScrollableTarget] =
        useState<HTMLDivElement | null>(null);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered={true}
            scrollBehavior="inside"
        >
            <ModalOverlay />
            <ModalContent
                maxHeight={{ base: undefined, sm: undefined, md: "90vh" }}
            >
                <ModalHeader>{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody paddingX={4} ref={(ref) => setScrollableTarget(ref)}>
                    {scrollableTarget && (
                        <InfiniteScroll
                            next={onFetchMore}
                            hasMore={hasMore}
                            loader={null}
                            dataLength={profiles.length}
                            scrollableTarget={
                                scrollableTarget as unknown as ReactElement
                            }
                            scrollThreshold="50px"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "100%",
                                paddingBottom: "0.5rem",
                            }}
                        >
                            {profiles.map((profile) => (
                                <HStack
                                    as={Link}
                                    to={"/users/" + profile.user.username}
                                    width="100%"
                                    padding={2}
                                    alignItems="start"
                                    spacing={4}
                                    cursor="pointer"
                                    _hover={{
                                        backgroundColor: "whiteAlpha.200",
                                    }}
                                    onClick={onClose}
                                >
                                    <Avatar
                                        size="md"
                                        src={profile.avatar || undefined}
                                    />
                                    <VStack alignItems="start" spacing={0}>
                                        <Text fontWeight="bold" fontSize="md">
                                            {profile.user.username}
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            overflowWrap="anywhere"
                                            noOfLines={1}
                                        >
                                            {profile.full_name}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                            {hasMore && <Spinner marginTop={2} />}
                        </InfiniteScroll>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default ProfileListModal;
