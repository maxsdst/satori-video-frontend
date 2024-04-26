import { Avatar, HStack, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Profile from "../entities/Profile";
import { formatNumber } from "../utils";

interface Props {
    profiles: Profile[];
}

function ProfileList({ profiles }: Props) {
    return (
        <VStack width="100%" alignItems="start">
            {profiles.map((profile) => (
                <HStack
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
                    <Avatar size="lg" src={profile.avatar || undefined} />
                    <VStack alignItems="start" spacing={0} width="100%">
                        <Text fontWeight="bold" fontSize="md">
                            {profile.user.username}
                        </Text>
                        <HStack spacing={2} fontSize="sm" width="100%">
                            <Text overflowWrap="anywhere" noOfLines={1}>
                                {profile.full_name}
                            </Text>
                            <Text>·</Text>
                            <Text opacity={0.8}>
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
