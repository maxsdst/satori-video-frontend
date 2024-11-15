import {
    Button,
    HStack,
    Image,
    StackProps,
    useBoolean,
    useBreakpointValue,
} from "@chakra-ui/react";
import {
    AiOutlineArrowLeft,
    AiOutlineSearch,
    AiOutlineUpload,
} from "react-icons/ai";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link } from "react-router-dom";
import useOwnProfile from "../hooks/profiles/useOwnProfile";
import IconButton from "./IconButton";
import NotificationsPopover from "./NotificationsPopover";
import SearchInput from "./SearchInput";
import UserMenu from "./UserMenu";

interface Props {
    isSidenavOpen: boolean;
    toggleSidenav: () => void;
}

function TopNav({ isSidenavOpen, toggleSidenav }: Props) {
    const { data: profile, isLoading } = useOwnProfile();

    const shouldHideSearchInput = useBreakpointValue({ base: true, md: false });

    const [isSearchModeOn, { on: setSearchModeOn, off: setSearchModeOff }] =
        useBoolean(false);

    const styles: StackProps = {
        position: "fixed",
        top: 0,
        width: "100%",
        padding: 2,
        zIndex: 1,
        backgroundColor: "var(--chakra-colors-chakra-body-bg);",
    };

    if (isSearchModeOn)
        return (
            <HStack data-testid="topnav" {...styles} justifyContent="center">
                <IconButton
                    label="Back"
                    icon={AiOutlineArrowLeft}
                    onClick={() => setSearchModeOff()}
                />
                <SearchInput />
            </HStack>
        );

    return (
        <HStack data-testid="topnav" {...styles} justifyContent="space-between">
            <HStack>
                <IconButton
                    label={
                        isSidenavOpen ? "Hide navigation" : "Show navigation"
                    }
                    disableTooltip={true}
                    icon={RxHamburgerMenu}
                    onClick={() => toggleSidenav()}
                />
                <Link to="/">
                    <Image
                        aria-label="Logo"
                        src="/logo.svg"
                        boxSize="40px"
                        filter="invert(100%); drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.5));"
                    />
                </Link>
            </HStack>
            {!shouldHideSearchInput && <SearchInput />}
            <HStack spacing={5}>
                <HStack spacing={1}>
                    {shouldHideSearchInput && (
                        <IconButton
                            dataTestId="topnav-search-button"
                            icon={AiOutlineSearch}
                            label="Search"
                            onClick={() => setSearchModeOn()}
                        />
                    )}
                    {isLoading || !profile ? null : (
                        <>
                            <IconButton
                                label="Upload"
                                icon={AiOutlineUpload}
                                link="/uploads?upload"
                            />
                            <NotificationsPopover />
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
