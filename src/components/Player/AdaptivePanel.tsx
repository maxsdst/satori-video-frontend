import { Box, HStack, Portal, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { MdOutlineClose } from "react-icons/md";
import IconButton from "../IconButton";

interface Props {
    onClose: () => void;
    width: string;
    height: string;
    minHeight?: string;
    isFullscreen: boolean;
    borderRadius: string;
    header: ReactNode;
    children: ReactNode;
}

function AdaptivePanel({
    onClose,
    width,
    height,
    minHeight,
    isFullscreen,
    borderRadius,
    header,
    children,
}: Props) {
    const headerHeight = "3rem";

    const panel = (
        <Box
            width={width}
            height={height}
            minHeight={minHeight}
            backgroundColor="gray.700"
            position={isFullscreen ? "fixed" : "relative"}
            top={isFullscreen ? 0 : undefined}
            zIndex={2}
            borderRightRadius={!isFullscreen ? borderRadius : undefined}
            onTouchStartCapture={(e) => e.stopPropagation()}
        >
            <VStack spacing={0}>
                <HStack
                    justifyContent="space-between"
                    width="100%"
                    height={headerHeight}
                    paddingLeft={5}
                    paddingRight={1}
                    paddingY={1}
                    spacing={0}
                >
                    <Box width="100%" height="100%">
                        {header}
                    </Box>
                    <IconButton
                        icon={MdOutlineClose}
                        label="Close"
                        onClick={onClose}
                    />
                </HStack>
                <Box width="100%" height={`calc(${height} - ${headerHeight})`}>
                    {children}
                </Box>
            </VStack>
        </Box>
    );

    if (isFullscreen) return <Portal>{panel}</Portal>;

    return panel;
}

export default AdaptivePanel;
