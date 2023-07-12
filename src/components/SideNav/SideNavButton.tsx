import { Button, Icon } from "@chakra-ui/react";
import { IconType } from "react-icons";

interface Props {
    icon: IconType;
    children: string;
}

function SideNavButton({ icon, children }: Props) {
    return (
        <Button
            variant="ghost"
            width="100%"
            justifyContent="left"
            iconSpacing={4}
            leftIcon={<Icon as={icon} boxSize={6} />}
        >
            {children}
        </Button>
    );
}

export default SideNavButton;
