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
                <ModalBody
                    data-testid="user-list-container"
                    paddingX={4}
                    ref={(ref) => setScrollableTarget(ref)}
                >
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
                            style={{ width: "100%" }}
                        >
                            <VStack
                                role="list"
                                aria-label="Users"
                                width="100%"
                                paddingBottom="0.5rem"
                            >
                                {profiles.map((profile) => (
                                    <HStack
                                        key={profile.id}
                                        role="listitem"
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
                                            aria-label="Avatar"
                                            size="md"
                                            src={profile.avatar || undefined}
                                        />
                                        <VStack alignItems="start" spacing={0}>
                                            <Text
                                                aria-label="Username"
                                                fontWeight="bold"
                                                fontSize="md"
                                            >
                                                {profile.user.username}
                                            </Text>
                                            <Text
                                                aria-label="Full name"
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
                            </VStack>
                        </InfiniteScroll>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default ProfileListModal;
