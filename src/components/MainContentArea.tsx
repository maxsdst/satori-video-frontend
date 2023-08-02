import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import { MAIN_CONTENT_AREA_PADDING } from "../styleConstants";

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
            padding={MAIN_CONTENT_AREA_PADDING}
        >
            {children}
        </Flex>
    );
}

export default MainContentArea;
