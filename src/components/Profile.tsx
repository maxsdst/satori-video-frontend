import {
    Avatar,
    Button,
    Flex,
    HStack,
    Heading,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import ProfileEntity from "../entities/Profile";
import useOwnProfile from "../hooks/useOwnProfile";
import EditProfileModal from "./EditProfileModal";

interface Props {
    profile: ProfileEntity;
}

function Profile({ profile }: Props) {
    const {
        isOpen: isEditModalOpen,
        onOpen: openEditModal,
        onClose: closeEditModal,
    } = useDisclosure();

    const { data: ownProfile, isLoading, error } = useOwnProfile();
    if (isLoading) return null;
    if (error) throw error;

    const isOwnProfile = profile.user.username === ownProfile?.user.username;

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
                    <Avatar size="2xl" src={profile.avatar || undefined} />
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
                    <Heading size="md">{profile.full_name}</Heading>
                    <Text fontSize="md">@{profile.user.username}</Text>
                </VStack>
                {profile.description && <Text>{profile.description}</Text>}
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
                    profile={profile}
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                />
            )}
        </>
    );
}

export default Profile;
