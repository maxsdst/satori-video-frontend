import {
    Button,
    ChakraProps,
    Text,
    ThemingProps,
    VStack,
    useBoolean,
} from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";
import { getLineHeightInPx } from "../utils";

interface Props {
    noOfLines: number;
    fontSize?: ChakraProps["fontSize"];
    expandButtonSize?: ThemingProps<"Button">["size"];
    children: string;
}

function ExpandableText({
    noOfLines,
    fontSize,
    expandButtonSize,
    children,
}: Props) {
    const [isTextTooLong, setTextTooLong] = useState(false);
    const [isExpanded, { toggle: toggleExpanded }] = useBoolean(false);

    const text = useRef<HTMLParagraphElement>(null);

    useLayoutEffect(() => {
        if (!text.current) return;

        const lineHeight = getLineHeightInPx(text.current);
        const height = text.current.scrollHeight;

        setTextTooLong(height > lineHeight * noOfLines);
    }, [noOfLines, fontSize, children]);

    return (
        <VStack width="100%" alignItems="start" spacing={1}>
            <Text
                ref={text}
                fontSize={fontSize}
                noOfLines={isTextTooLong && !isExpanded ? noOfLines : undefined}
                wordBreak="break-word"
                whiteSpace="pre-line"
            >
                {children}
            </Text>
            {isTextTooLong && (
                <Button
                    variant="link"
                    size={expandButtonSize}
                    onClick={toggleExpanded}
                    opacity={0.8}
                    fontWeight="semibold"
                >
                    {isExpanded ? "Show less" : "Show more"}
                </Button>
            )}
        </VStack>
    );
}

export default ExpandableText;
