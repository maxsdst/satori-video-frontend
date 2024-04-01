import {
    Avatar,
    Box,
    HStack,
    PopoverBody,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import useProfileSearch from "../../hooks/profiles/useProfileSearch";
import { getAllResultsFromInfiniteQueryData } from "../../utils";

interface Props {
    searchQuery: string;
    onClose: () => void;
}

function ResultsPopoverContent({ searchQuery, onClose }: Props) {
    const {
        data: profileSearchResults,
        isInitialLoading,
        error,
    } = useProfileSearch(
        { searchQuery, pagination: { type: "cursor", pageSize: 5 } },
        { enabled: !!searchQuery }
    );

    const navigate = useNavigate();

    if (isInitialLoading) return null;
    if (error)
        return (
            <PopoverBody
                display="flex"
                width="100%"
                padding={4}
                justifyContent="center"
                alignItems="center"
            >
                <Text>An error occurred</Text>
            </PopoverBody>
        );

    const profiles = profileSearchResults
        ? getAllResultsFromInfiniteQueryData(profileSearchResults)
        : [];

    const itemProps = {
        width: "100%",
        paddingX: 4,
        cursor: "pointer",
        _hover: {
            backgroundColor: "whiteAlpha.200",
        },
    };

    return (
        <PopoverBody as={VStack} padding={0} spacing={0} alignItems="start">
            {profiles.length > 0 && (
                <>
                    <Box width="100%" paddingX={4} paddingY={1}>
                        <Text fontWeight="semibold" opacity={0.8}>
                            Users
                        </Text>
                    </Box>
                    <VStack width="100%" spacing={0}>
                        {profiles.map((profile) => (
                            <HStack
                                key={profile.id}
                                {...itemProps}
                                justifyContent="start"
                                paddingY={2}
                                onClick={() => {
                                    onClose();
                                    navigate("/users/" + profile.user.username);
                                }}
                            >
                                <Avatar
                                    size="md"
                                    src={profile.avatar || undefined}
                                />
                                <VStack
                                    alignItems="start"
                                    spacing={0}
                                    fontSize="md"
                                >
                                    <Text fontWeight="semibold">
                                        {profile.user.username}
                                    </Text>
                                    <Text
                                        opacity={0.8}
                                        overflowWrap="anywhere"
                                        noOfLines={1}
                                    >
                                        {profile.full_name}
                                    </Text>
                                </VStack>
                            </HStack>
                        ))}
                    </VStack>
                </>
            )}
            <Box
                {...itemProps}
                paddingY={4}
                onClick={() => {
                    onClose();
                    navigate("/search/?query=" + searchQuery);
                }}
            >
                <Text fontWeight="semibold">{`View all results for "${searchQuery}"`}</Text>
            </Box>
        </PopoverBody>
    );
}

export default ResultsPopoverContent;
