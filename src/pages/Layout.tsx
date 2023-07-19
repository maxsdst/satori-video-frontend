import {
    Box,
    Flex,
    Grid,
    GridItem,
    useBoolean,
    useBreakpointValue,
} from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";

function Layout() {
    const shouldOpenSidenav = useBreakpointValue(
        { md: false, lg: true },
        { ssr: false, fallback: "md" }
    );

    const [isSidenavOpened, { toggle: toggleSidenav }] =
        useBoolean(shouldOpenSidenav);

    return (
        <Grid
            templateAreas={`"topnav" "main"`}
            templateColumns="1fr"
            templateRows={"56px 1fr"}
            height="100vh"
        >
            <GridItem area="topnav">
                <TopNav toggleSidenav={toggleSidenav} />
            </GridItem>
            <GridItem area="main">
                <Flex direction="row" width="100%" height="100%">
                    {isSidenavOpened && <SideNav />}
                    <Box padding={5} width="100%" height="100%">
                        <Outlet />
                    </Box>
                </Flex>
            </GridItem>
        </Grid>
    );
}

export default Layout;
