import {
    Avatar,
    Button,
    Flex,
    HStack,
    Heading,
    Spinner,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import useOwnProfile from "../hooks/useOwnProfile";
import useProfile from "../hooks/useProfile";
import EditProfileModal from "./EditProfileModal";

interface Props {
    username: string;
}

function Profile({ username }: Props) {
    const {
        isOpen: isEditModalOpen,
        onOpen: openEditModal,
        onClose: closeEditModal,
    } = useDisclosure();

    const profile = useProfile(username);
    const ownProfile = useOwnProfile();

    if (profile.isLoading || ownProfile.isLoading) return <Spinner />;
    if (profile.error) throw profile.error;
    if (ownProfile.error) throw ownProfile.error;

    const isOwnProfile =
        profile.data.user.username === ownProfile.data?.user.username;

    return (
        <>
            <VStack
                alignItems="start"
                width="100%"
                maxWidth="800px"
                spacing={5}
            >
                <Flex
                    direction="row"
                    width="100%"
                    justifyContent="space-between"
                    alignItems="end"
                >
                    <Avatar size="2xl" src={profile.data.avatar || undefined} />
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
                            variant="solid"
                            colorScheme="blue"
                            size="md"
                            fontWeight="bold"
                            onClick={() => {}}
                        >
                            Follow
                        </Button>
                    )}
                </Flex>
                <VStack alignItems="start" spacing={1} width="100%">
                    <Heading size="md">{profile.data.full_name}</Heading>
                    <Text fontSize="md">@{profile.data.user.username}</Text>
                </VStack>
                {profile.data.description && (
                    <Text>{profile.data.description}</Text>
                )}
                <HStack spacing={5} fontSize="sm">
                    <Text>
                        <b>123</b> Following
                    </Text>
                    <Text>
                        <b>12.3K</b> Followers
                    </Text>
                </HStack>
            </VStack>
            {isOwnProfile && (
                <EditProfileModal
                    profile={profile.data}
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                />
            )}
        </>
    );
}

export default Profile;
