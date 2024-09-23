import { Avatar, HStack, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Profile from "../entities/Profile";
import { formatNumber } from "../utils";

interface Props {
    profiles: Profile[];
}

function ProfileList({ profiles }: Props) {
    return (
        <VStack role="list" aria-label="Users" width="100%" alignItems="start">
            {profiles.map((profile) => (
                <HStack
                    key={profile.id}
                    role="listitem"
                    as={Link}
                    to={"/users/" + profile.user.username}
                    width="100%"
                    maxWidth="700px"
                    padding={4}
                    alignItems="start"
                    spacing={4}
                    cursor="pointer"
                    _hover={{
                        backgroundColor: "whiteAlpha.200",
                    }}
                >
                    <Avatar
                        aria-label="Avatar"
                        size="lg"
                        src={profile.avatar || undefined}
                    />
                    <VStack alignItems="start" spacing={0} width="100%">
                        <Text
                            aria-label="Username"
                            fontWeight="bold"
                            fontSize="md"
                        >
                            {profile.user.username}
                        </Text>
                        <HStack spacing={2} fontSize="sm" width="100%">
                            <Text
                                aria-label="Full name"
                                overflowWrap="anywhere"
                                noOfLines={1}
                            >
                                {profile.full_name}
                            </Text>
                            <Text>·</Text>
                            <Text
                                aria-label="Number of followers"
                                opacity={0.8}
                            >
                                <span
                                    style={{
                                        fontWeight: "600",
                                    }}
                                >
                                    {formatNumber(profile.follower_count)}
                                </span>{" "}
                                Followers
                            </Text>
                        </HStack>
                        {profile.description && (
                            <Text
                                aria-label="Description"
                                noOfLines={1}
                                fontSize="sm"
                                marginTop={1}
                                width="100%"
                                overflowWrap="anywhere"
                            >
                                {profile.description}
                            </Text>
                        )}
                    </VStack>
                </HStack>
            ))}
        </VStack>
    );
}

export default ProfileList;
