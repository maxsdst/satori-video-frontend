import { Grid, GridItem, Show } from "@chakra-ui/react";
import SideNav from "./components/SideNav";
import TopNav from "./components/TopNav";
import Profile from "./components/Profile";
import UserVideosSection from "./components/UserVideosSection";
import VideoGrid from "./components/VideoGrid";

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
                <UserVideosSection />
                <VideoGrid />
            </GridItem>
        </Grid>
    );
}

export default App;
