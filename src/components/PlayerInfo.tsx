import { Avatar, HStack, Heading, VStack, Text } from "@chakra-ui/react";

function PlayerInfo() {
    const shadow = "drop-shadow( 0px 0px 4px rgba(0, 0, 0))";

    return (
        <VStack
            filter={shadow}
            paddingX={4}
            paddingBottom={4}
            alignItems="flex-start"
            spacing={1}
        >
            <HStack>
                <Avatar size="xs" />
                <Heading fontSize="sm">username</Heading>
            </HStack>
            <Text fontSize="sm" noOfLines={1}>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Cupiditate deleniti assumenda modi ab sequi at nesciunt,
                corporis architecto reiciendis blanditiis, odio porro, enim
                beatae sunt nihil numquam tempora voluptatem accusamus?
            </Text>
        </VStack>
    );
}

export default PlayerInfo;
