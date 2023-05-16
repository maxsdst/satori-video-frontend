import { Grid, GridItem, Show } from "@chakra-ui/react";
import TopNav from "./components/TopNav";

function App() {
    return (
        <Grid
            templateAreas={{
                base: `"topnav" "main"`,
                lg: `"topnav topnav" "sidenav main"`,
            }}
            templateColumns={{
                base: "1fr",
                lg: "200px 1fr",
            }}
        >
            <GridItem area="topnav">
                <TopNav />
            </GridItem>
            <Show above="lg">
                <GridItem area="sidenav"></GridItem>
            </Show>
            <GridItem area="main"></GridItem>
        </Grid>
    );
}

export default App;
