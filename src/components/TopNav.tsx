import { Button, HStack, Hide, Image, useBoolean } from "@chakra-ui/react";
import {
    AiOutlineArrowLeft,
    AiOutlineBell,
    AiOutlineSearch,
    AiOutlineUpload,
} from "react-icons/ai";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link } from "react-router-dom";
import useOwnProfile from "../hooks/profiles/useOwnProfile";
import IconButton from "./IconButton";
import SearchInput from "./SearchInput";
import UserMenu from "./UserMenu";

interface Props {
    isSidenavOpen: boolean;
    toggleSidenav: () => void;
}

function TopNav({ isSidenavOpen, toggleSidenav }: Props) {
    const { data: profile, isLoading } = useOwnProfile();

    const [isSearchModeOn, { on: setSearchModeOn, off: setSearchModeOff }] =
        useBoolean(false);

    const padding = 2;

    if (isSearchModeOn)
        return (
            <HStack padding={padding} justifyContent="center">
                <IconButton
                    label="Search"
                    icon={AiOutlineArrowLeft}
                    onClick={() => setSearchModeOff()}
                />
                <SearchInput />
            </HStack>
        );

    return (
        <HStack padding={padding} justifyContent="space-between">
            <HStack>
                <IconButton
                    label={
                        isSidenavOpen ? "Hide navigation" : "Show navigation"
                    }
                    icon={RxHamburgerMenu}
                    onClick={() => toggleSidenav()}
                />
                <Image src={""} boxSize="40px" />
            </HStack>
            <SearchInput
                styles={{
                    display: {
                        base: "none",
                        md: "block",
                    },
                }}
            />
            <HStack spacing={5}>
                <HStack spacing={1}>
                    <Hide above="md">
                        <IconButton
                            icon={AiOutlineSearch}
                            label="Search"
                            onClick={() => setSearchModeOn()}
                        />
                    </Hide>
                    {isLoading || !profile ? null : (
                        <>
                            <IconButton
                                label="Upload"
                                icon={AiOutlineUpload}
                                link="/uploads?upload"
                            />
                            <IconButton
                                label="Notifications"
                                icon={AiOutlineBell}
                            />
                        </>
                    )}
                </HStack>
                {isLoading ? null : profile ? (
                    <UserMenu />
                ) : (
                    <Link to="/login">
                        <Button colorScheme="blue">Log in</Button>
                    </Link>
                )}
            </HStack>
        </HStack>
    );
}

export default TopNav;
