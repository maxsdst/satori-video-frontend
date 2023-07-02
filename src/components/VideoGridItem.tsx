import {
    AspectRatio,
    Avatar,
    HStack,
    Icon,
    Image,
    Text,
    VStack,
} from "@chakra-ui/react";
import { AiOutlineHeart } from "react-icons/ai";

function VideoGridItem() {
    return (
        <VStack maxWidth="600px" alignItems="start">
            <AspectRatio width="100%" ratio={3 / 4}>
                <Image
                    objectFit="cover"
                    src="https://i.pinimg.com/originals/9f/c9/8d/9fc98dfd612fe1eb13a6ae083444a4f6.jpg"
                />
            </AspectRatio>
            <Text fontSize="md" noOfLines={1}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius ex
                laudantium corporis, quod repudiandae maiores consequatur
                delectus eum ab vitae, quo voluptate error laboriosam, veniam
                culpa doloribus dolore. Nemo, magni?
            </Text>
            <HStack width="100%" justifyContent="space-between">
                <HStack>
                    <Avatar
                        size="xs"
                        src="https://i.pinimg.com/originals/9f/c9/8d/9fc98dfd612fe1eb13a6ae083444a4f6.jpg"
                    />
                    <Text>username</Text>
                </HStack>
                <HStack spacing={1}>
                    <Icon as={AiOutlineHeart} boxSize="22px" />
                    <Text fontSize="md">12.3K</Text>
                </HStack>
            </HStack>
        </VStack>
    );
}

export default VideoGridItem;
