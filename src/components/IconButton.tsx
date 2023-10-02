import {
    IconButton as ChakraIconButton,
    Icon,
    Tooltip,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { Link } from "react-router-dom";

interface Props {
    icon: IconType;
    label: string;
    size?: "sm" | "md";
    onClick?: () => void;
    link?: string;
}

function IconButton({ icon, size, label, onClick, link }: Props) {
    const buttonSize = size ?? "md";
    const iconBoxSizes = { sm: 5, md: 6 };
    const iconBoxSize = iconBoxSizes[buttonSize];

    const button = (
        <Tooltip placement="bottom" label={label}>
            <ChakraIconButton
                icon={<Icon as={icon} boxSize={iconBoxSize} />}
                aria-label={label}
                variant="ghost"
                borderRadius="50%"
                padding={0}
                onClick={onClick}
                size={size}
            />
        </Tooltip>
    );

    if (link) return <Link to={link}>{button}</Link>;

    return button;
}

export default IconButton;
