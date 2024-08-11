import {
    Avatar,
    HStack,
    Menu,
    MenuButton,
    MenuDivider,
    MenuList,
    Portal,
    Text,
    VStack,
} from "@chakra-ui/react";
import { AiOutlineLogout, AiOutlineUser } from "react-icons/ai";
import useLogout from "../../auth/hooks/useLogout";
import useOwnProfile from "../../hooks/profiles/useOwnProfile";
import UserMenuItem from "./UserMenuItem";

function UserMenu() {
    const logOut = useLogout();

    const { data: profile, isLoading, error } = useOwnProfile();
    if (isLoading || error) return <Avatar size="sm" />;

    if (!profile) return null;

    return (
        <Menu>
            <MenuButton aria-label="Account menu">
                <Avatar
                    size="sm"
                    _hover={{ cursor: "pointer" }}
                    src={profile.avatar || undefined}
                />
            </MenuButton>
            <Portal>
                <MenuList width="300px" padding={0} zIndex={10}>
                    <HStack spacing={4} padding={4}>
                        <Avatar
                            aria-label="Avatar"
                            size="md"
                            src={profile.avatar || undefined}
                        />
                        <VStack spacing={0} alignItems="start">
                            <Text
                                aria-label="Full name"
                                fontWeight="bold"
                                overflowWrap="anywhere"
                                noOfLines={1}
                            >
                                {profile.full_name}
                            </Text>
                            <Text aria-label="Username">
                                @{profile.user.username}
                            </Text>
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
            </Portal>
        </Menu>
    );
}

export default UserMenu;
