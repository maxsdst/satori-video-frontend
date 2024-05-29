import { Button, Icon } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { Link } from "react-router-dom";

interface Props {
    icon: IconType;
    children: string;
    link: string;
    onClick: () => void;
}

function SideNavButton({ icon, children, link, onClick }: Props) {
    return (
        <Link to={link} style={{ width: "100%" }}>
            <Button
                variant="ghost"
                width="100%"
                justifyContent="left"
                iconSpacing={4}
                leftIcon={<Icon as={icon} boxSize={6} />}
                onClick={onClick}
            >
                {children}
            </Button>
        </Link>
    );
}

export default SideNavButton;
