import { Button, Icon, VStack, Text, As } from "@chakra-ui/react";

interface Props {
    icon: As;
    children?: string;
    onClick: () => void;
}

function PlayerButton({ icon, children, onClick }: Props) {
    return (
        <Button
            variant="ghost"
            width="60px"
            paddingY={6}
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
                    boxSize="28px"
                    filter="var(--player-drop-shadow)"
                />
                {children && (
                    <Text
                        fontSize="sm"
                        filter="var(--player-drop-shadow)"
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
