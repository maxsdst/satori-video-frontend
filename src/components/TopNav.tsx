import { Button, HStack, Hide, Image, useBoolean } from "@chakra-ui/react";
import {
    AiOutlineArrowLeft,
    AiOutlineBell,
    AiOutlineSearch,
    AiOutlineUpload,
} from "react-icons/ai";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link } from "react-router-dom";
import useOwnProfile from "../hooks/useOwnProfile";
import SearchInput from "./SearchInput";
import TopNavButton from "./TopNavButton";
import UserMenu from "./UserMenu";

interface Props {
    toggleSidenav: () => void;
}

function TopNav({ toggleSidenav }: Props) {
    const { data: profile, isLoading } = useOwnProfile();

    const [isSearchModeOn, { on: setSearchModeOn, off: setSearchModeOff }] =
        useBoolean(false);

    const padding = 2;

    if (isSearchModeOn)
        return (
            <HStack padding={padding} justifyContent="center">
                <TopNavButton
                    icon={AiOutlineArrowLeft}
                    onClick={() => setSearchModeOff()}
                />
                <SearchInput />
            </HStack>
        );

    return (
        <HStack padding={padding} justifyContent="space-between">
            <HStack>
                <TopNavButton
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
                        <TopNavButton
                            icon={AiOutlineSearch}
                            tooltipLabel="Search"
                            onClick={() => setSearchModeOn()}
                        />
                    </Hide>
                    {isLoading || !profile ? null : (
                        <>
                            <TopNavButton
                                tooltipLabel="Upload"
                                icon={AiOutlineUpload}
                            />
                            <TopNavButton
                                tooltipLabel="Notifications"
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
