import {
    Avatar,
    HStack,
    Menu,
    MenuButton,
    MenuDivider,
    MenuList,
    Text,
    VStack,
} from "@chakra-ui/react";
import { AiOutlineLogout, AiOutlineUser } from "react-icons/ai";
import useLogout from "../../auth/hooks/useLogout";
import useOwnProfile from "../../hooks/useOwnProfile";
import UserMenuItem from "./UserMenuItem";

function UserMenu() {
    const logOut = useLogout();

    const { data: profile, isLoading, error } = useOwnProfile();
    if (isLoading || error) return <Avatar size="sm" />;

    if (!profile) return null;

    return (
        <Menu>
            <MenuButton>
                <Avatar
                    size="sm"
                    _hover={{ cursor: "pointer" }}
                    src={profile.avatar || undefined}
                />
            </MenuButton>
            <MenuList width="300px" padding={0}>
                <HStack spacing={4} padding={4}>
                    <Avatar size="md" src={profile.avatar || undefined} />
                    <VStack spacing={0} alignItems="start">
                        <Text
                            fontWeight="bold"
                            overflowWrap="anywhere"
                            noOfLines={1}
                        >
                            {profile.full_name}
                        </Text>
                        <Text>@{profile.user.username}</Text>
                    </VStack>
                </HStack>
                <MenuDivider />
                <UserMenuItem
                    icon={AiOutlineUser}
                    link={"/users/" + profile.user.username}
                >
                    My Profile
                </UserMenuItem>
                <UserMenuItem
                    icon={AiOutlineLogout}
                    onClick={() => {
                        logOut();
                        window.location.reload();
                    }}
                >
                    Log out
                </UserMenuItem>
            </MenuList>
        </Menu>
    );
}

export default UserMenu;
