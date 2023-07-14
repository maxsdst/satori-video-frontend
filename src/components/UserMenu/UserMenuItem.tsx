import { HStack, Icon, MenuItem, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { useNavigate } from "react-router-dom";

interface Props {
    icon: IconType;
    onClick?: () => void;
    link?: string;
    children: string;
}

function UserMenuItem({ icon, children, onClick, link }: Props) {
    const navigate = useNavigate();

    return (
        <MenuItem
            onClick={() => {
                onClick?.();
                link && navigate(link);
            }}
        >
            <HStack padding={1} spacing={4}>
                <Icon as={icon} boxSize={6} />
                <Text>{children}</Text>
            </HStack>
        </MenuItem>
    );
}

export default UserMenuItem;
