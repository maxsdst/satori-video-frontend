import { Grid, GridItem, Show } from "@chakra-ui/react";
import SideNav from "./components/SideNav";
import TopNav from "./components/TopNav";
import Player from "./components/Player";

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
            <GridItem area="main">
                <Player url="https://i.imgur.com/6LSoWIo.mp4" />
            </GridItem>
        </Grid>
    );
}

export default App;
