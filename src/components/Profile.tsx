import {
    Avatar,
    Button,
    Flex,
    HStack,
    Heading,
    Spinner,
    Text,
    VStack,
} from "@chakra-ui/react";
import useProfile from "../hooks/useProfile";

interface Props {
    username: string;
}

function Profile({ username }: Props) {
    const { data: profile, isLoading, error } = useProfile(username);

    if (isLoading) return <Spinner />;
    if (error) throw error;

    return (
        <VStack alignItems="start" width="100%" maxWidth="800px" spacing={5}>
            <Flex
                direction="row"
                width="100%"
                justifyContent="space-between"
                alignItems="end"
            >
                <Avatar
                    size="2xl"
                    marginX={3}
                    src={profile.avatar || undefined}
                />
                <Button
                    size="md"
                    colorScheme="blue"
                    fontWeight="bold"
                    margin={3}
                >
                    Follow
                </Button>
            </Flex>
            <VStack alignItems="start" spacing={1}>
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
    );
}

export default Profile;
