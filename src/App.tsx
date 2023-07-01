import { Grid, GridItem, Show } from "@chakra-ui/react";
import SideNav from "./components/SideNav";
import TopNav from "./components/TopNav";
import AuthBox from "./auth/components/AuthBox";
import Player from "./components/Player";
import Profile from "./components/Profile";

function App() {
    return (
        <Grid
            templateAreas={{
                base: `"topnav" "main"`,
                lg: `"topnav topnav" "sidenav main"`,
            }}
            templateColumns={{
                base: "1fr",
                lg: "240px 1fr",
            }}
            templateRows={"56px 1fr"}
            height="100vh"
        >
            <GridItem area="topnav">
                <TopNav />
            </GridItem>
            <Show above="lg">
                <GridItem area="sidenav">
                    <SideNav />
                </GridItem>
            </Show>
            <GridItem area="main" padding={5}>
                <Profile />
            </GridItem>
        </Grid>
    );
}

export default App;
