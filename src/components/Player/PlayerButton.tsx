import { As, Button, Icon, IconProps, Text, VStack } from "@chakra-ui/react";
import { PLAYER_DROP_SHADOW } from "../../styleConstants";

interface Props {
    icon: As;
    iconColor?: IconProps["color"];
    children?: string;
    onClick: () => void;
    ariaLabel?: string;
}

function PlayerButton({
    icon,
    iconColor,
    children,
    onClick,
    ariaLabel,
}: Props) {
    return (
        <Button
            aria-label={ariaLabel}
            variant="ghost"
            width="60px"
            height="60px"
            borderRadius="50%"
            padding={0}
            opacity={0.9}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            onTouchStartCapture={(e) => e.stopPropagation()}
        >
            <VStack spacing={0}>
                <Icon
                    as={icon}
                    color={iconColor}
                    boxSize="28px"
                    filter={PLAYER_DROP_SHADOW}
                />
                {children && (
                    <Text
                        fontSize="sm"
                        filter={PLAYER_DROP_SHADOW}
                        fontWeight="normal"
                    >
                        {children}
                    </Text>
                )}
            </VStack>
        </Button>
    );
}

export default PlayerButton;
