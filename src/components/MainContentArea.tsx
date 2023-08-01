import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";

interface Props {
    isContentCentered: boolean;
    children?: ReactNode;
}

function MainContentArea({ isContentCentered, children }: Props) {
    return (
        <Flex
            width="100%"
            height="100%"
            justifyContent={isContentCentered ? "center" : undefined}
            alignItems={isContentCentered ? "center" : undefined}
            padding="20px"
        >
            {children}
        </Flex>
    );
}

export default MainContentArea;
