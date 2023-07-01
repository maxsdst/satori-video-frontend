import {
    Avatar,
    Button,
    Flex,
    HStack,
    Heading,
    Text,
    VStack,
} from "@chakra-ui/react";

function Profile() {
    return (
        <VStack alignItems="start" maxWidth="800px" spacing={5}>
            <Flex
                direction="row"
                width="100%"
                justifyContent="space-between"
                alignItems="end"
            >
                <Avatar
                    size="2xl"
                    marginX={3}
                    src="https://i.pinimg.com/originals/9f/c9/8d/9fc98dfd612fe1eb13a6ae083444a4f6.jpg"
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
                <Heading size="md">Full Name</Heading>
                <Text fontSize="md">@username</Text>
            </VStack>
            <Text>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio
                facilis ipsa et distinctio illo exercitationem ab saepe
                expedita, sint esse incidunt ullam laborum, quasi nihil,
                assumenda natus totam laudantium provident?
            </Text>
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
