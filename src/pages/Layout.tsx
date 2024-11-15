import {
    Box,
    Flex,
    Grid,
    GridItem,
    useBoolean,
    useBreakpointValue,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import { SIDENAV_WIDTH, TOPNAV_HEIGHT } from "../styleConstants";

interface Props {
    children?: ReactNode;
}

function Layout({ children }: Props) {
    const shouldOpenSidenav = useBreakpointValue(
        { md: false, lg: true },
        { ssr: false, fallback: "md" }
    );

    const [isSidenavOpen, { toggle: toggleSidenav, off: closeSidenav }] =
        useBoolean(shouldOpenSidenav);

    const isSidenavFullscreen = useBreakpointValue({ base: true, md: false });

    return (
        <Grid
            templateAreas={`"topnav" "main"`}
            templateColumns="1fr"
            templateRows={`${TOPNAV_HEIGHT} 1fr`}
            height="100vh"
        >
            <GridItem area="topnav">
                <TopNav
                    isSidenavOpen={isSidenavOpen}
                    toggleSidenav={toggleSidenav}
                />
            </GridItem>
            <GridItem area="main">
                <Flex direction="row" width="100%" height="100%">
                    {isSidenavOpen && (
                        <SideNav
                            isFullscreen={!!isSidenavFullscreen}
                            onClose={closeSidenav}
                        />
                    )}
                    <Box
                        as="main"
                        width="100%"
                        height="100%"
                        display={{
                            base: isSidenavOpen ? "none" : "block",
                            md: "block",
                        }}
                        marginLeft={{
                            base: 0,
                            md: isSidenavOpen ? SIDENAV_WIDTH : 0,
                        }}
                    >
                        {children ?? <Outlet />}
                    </Box>
                </Flex>
            </GridItem>
        </Grid>
    );
}

export default Layout;
