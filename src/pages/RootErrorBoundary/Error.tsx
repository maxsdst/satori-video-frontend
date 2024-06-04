import { AspectRatio, Image, Text, VStack } from "@chakra-ui/react";
import MainContentArea from "../../components/MainContentArea";

interface Props {
    imageSrc: string;
    children: string;
}

function Error({ imageSrc, children }: Props) {
    return (
        <MainContentArea isContentCentered={true}>
            <VStack width="100%">
                <AspectRatio ratio={1 / 1} width="100%" maxWidth="300px">
                    <Image objectFit="cover" src={imageSrc} />
                </AspectRatio>
                <Text fontSize="2xl" fontWeight="semibold">
                    {children}
                </Text>
            </VStack>
        </MainContentArea>
    );
}

export default Error;
