import {
    Avatar,
    Box,
    Button,
    HStack,
    Heading,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import { useMemo } from "react";
import ProfileEntity from "../entities/Profile";
import useFollow from "../hooks/profiles/useFollow";
import useFollowers from "../hooks/profiles/useFollowers";
import useFollowing from "../hooks/profiles/useFollowing";
import useOwnProfile from "../hooks/profiles/useOwnProfile";
import useUnfollow from "../hooks/profiles/useUnfollow";
import { formatNumber, getAllResultsFromInfiniteQueryData } from "../utils";
import EditProfileModal from "./EditProfileModal";
import LoginRequestModal from "./LoginRequestModal";
import ProfileListModal from "./ProfileListModal";

interface Props {
    profile: ProfileEntity;
}

function Profile({ profile }: Props) {
    const username = profile.user.username;

    const {
        isOpen: isEditModalOpen,
        onOpen: openEditModal,
        onClose: closeEditModal,
    } = useDisclosure();

    const {
        isOpen: isLoginRequestModalOpen,
        onOpen: openLoginRequestModal,
        onClose: closeLoginRequestModal,
    } = useDisclosure();

    const {
        isOpen: isFollowingModalOpen,
        onOpen: openFollowingModal,
        onClose: closeFollowingModal,
    } = useDisclosure();

    const {
        isOpen: isFollowersModalOpen,
        onOpen: openFollowersModal,
        onClose: closeFollowersModal,
    } = useDisclosure();

    const { data: ownProfile, isLoading, isSuccess, error } = useOwnProfile();

    const follow = useFollow(username, {
        shouldUpdateProfileOptimistically: true,
    });
    const unfollow = useUnfollow(username, {
        shouldUpdateProfileOptimistically: true,
    });

    const following = useFollowing(
        {
            username: username,
            pagination: { type: "cursor", pageSize: 10 },
        },
        { enabled: isFollowingModalOpen }
    );
    const followingProfiles = useMemo<ProfileEntity[]>(() => {
        return following.data
            ? getAllResultsFromInfiniteQueryData(following.data)
            : [];
    }, [following.data]);

    const followers = useFollowers(
        {
            username: username,
            pagination: { type: "cursor", pageSize: 10 },
        },
        { enabled: isFollowersModalOpen }
    );
    const followersProfiles = useMemo<ProfileEntity[]>(() => {
        return followers.data
            ? getAllResultsFromInfiniteQueryData(followers.data)
            : [];
    }, [followers.data]);

    if (isLoading) return null;
    if (error) throw error;

    const isAuthenticated = isSuccess ? !!ownProfile : undefined;
    const isOwnProfile = username === ownProfile?.user.username;

    return (
        <>
            <VStack
                data-testid="profile"
                alignItems="start"
                width="100%"
                maxWidth="800px"
                spacing={5}
            >
                <HStack width="100%" spacing={5}>
                    <Avatar
                        aria-label="Avatar"
                        size="2xl"
                        src={profile.avatar || undefined}
                    />
                    <VStack alignItems="start" spacing={4}>
                        <VStack alignItems="start" spacing={1} width="100%">
                            <Heading
                                aria-label="Full name"
                                size="md"
                                overflowWrap="anywhere"
                            >
                                {profile.full_name}
                            </Heading>
                            <Text
                                aria-label="Username"
                                fontSize="md"
                                overflowWrap="anywhere"
                            >
                                @{profile.user.username}
                            </Text>
                        </VStack>
                        {isOwnProfile ? (
                            <Button
                                variant="outline"
                                colorScheme="blue"
                                size="md"
                                fontWeight="bold"
                                onClick={() => openEditModal()}
                            >
                                Edit profile
                            </Button>
                        ) : (
                            <Button
                                variant={
                                    profile.is_following ? "outline" : "solid"
                                }
                                colorScheme="blue"
                                size="md"
                                fontWeight="bold"
                                onClick={() => {
                                    if (!isAuthenticated)
                                        openLoginRequestModal();
                                    else if (profile.is_following)
                                        unfollow.mutate(null);
                                    else follow.mutate(null);
                                }}
                            >
                                {profile.is_following ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                    </VStack>
                </HStack>
                {profile.description && (
                    <Text
                        aria-label="Description"
                        overflowWrap="anywhere"
                        whiteSpace="pre-line"
                    >
                        {profile.description}
                    </Text>
                )}
                <HStack spacing={5} fontSize="sm">
                    <Box
                        aria-label="Number of followed users"
                        _hover={{
                            cursor: "pointer",
                            textDecoration: "underline",
                        }}
                        onClick={openFollowingModal}
                    >
                        <Text>
                            <b>{formatNumber(profile.following_count)}</b>{" "}
                            Following
                        </Text>
                    </Box>
                    <Box
                        aria-label="Number of followers"
                        _hover={{
                            cursor: "pointer",
                            textDecoration: "underline",
                        }}
                        onClick={openFollowersModal}
                    >
                        <Text>
                            <b>{formatNumber(profile.follower_count)}</b>{" "}
                            Followers
                        </Text>
                    </Box>
                </HStack>
            </VStack>
            {isOwnProfile && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                />
            )}
            {isAuthenticated === false && (
                <LoginRequestModal
                    isOpen={isLoginRequestModalOpen}
                    onClose={closeLoginRequestModal}
                    header="Want to follow this profile?"
                >
                    Sign in to follow this profile.
                </LoginRequestModal>
            )}
            <ProfileListModal
                profiles={followingProfiles}
                hasMore={!!following.hasNextPage}
                onFetchMore={following.fetchNextPage}
                header="Following"
                isOpen={isFollowingModalOpen}
                onClose={closeFollowingModal}
            />
            <ProfileListModal
                profiles={followersProfiles}
                hasMore={!!followers.hasNextPage}
                onFetchMore={followers.fetchNextPage}
                header="Followers"
                isOpen={isFollowersModalOpen}
                onClose={closeFollowersModal}
            />
        </>
    );
}

export default Profile;
