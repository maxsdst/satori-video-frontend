import { Button, Icon, Tooltip } from "@chakra-ui/react";
import { IconType } from "react-icons";

interface Props {
    icon: IconType;
    tooltipLabel?: string;
    onClick?: () => void;
}

function TopNavButton({ icon, tooltipLabel, onClick }: Props) {
    const button = (
        <Button
            variant="ghost"
            borderRadius="50%"
            padding={0}
            onClick={() => onClick?.()}
        >
            <Icon as={icon} boxSize={6} />
        </Button>
    );

    if (tooltipLabel)
        return (
            <Tooltip placement="bottom" label={tooltipLabel}>
                {button}
            </Tooltip>
        );

    return button;
}

export default TopNavButton;
