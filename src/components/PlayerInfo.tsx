import { Avatar, HStack, Heading, VStack, Text } from "@chakra-ui/react";

function PlayerInfo() {
    return (
        <VStack
            paddingX={4}
            paddingBottom={4}
            alignItems="flex-start"
            spacing={1}
            filter="var(--player-drop-shadow)"
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
