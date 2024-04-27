import { Divider, VStack } from "@chakra-ui/react";
import {
    AiOutlineClockCircle,
    AiOutlineFire,
    AiOutlineHistory,
    AiOutlineHome,
    AiOutlinePlaySquare,
} from "react-icons/ai";
import { HiOutlineBookmark } from "react-icons/hi";
import { RiUserReceivedLine } from "react-icons/ri";
import SideNavButton from "./SideNavButton";

function SideNav() {
    return (
        <VStack
            alignItems="start"
            padding={2}
            position={{ base: "absolute", md: "static" }}
            width="100%"
            maxWidth={{ base: "100%", md: "240px" }}
            backgroundColor="var(--chakra-colors-chakra-body-bg);"
        >
            <SideNavButton icon={AiOutlineHome} link="/">
                For You
            </SideNavButton>
            <SideNavButton icon={AiOutlineFire} link="/popular">
                Popular
            </SideNavButton>
            <SideNavButton icon={AiOutlineClockCircle} link="/latest">
                Latest
            </SideNavButton>
            <Divider />
            <SideNavButton icon={RiUserReceivedLine} link="/following">
                Following
            </SideNavButton>
            <SideNavButton icon={HiOutlineBookmark} link="/saved">
                Saved
            </SideNavButton>
            <SideNavButton icon={AiOutlineHistory} link="/history">
                History
            </SideNavButton>
            <SideNavButton icon={AiOutlinePlaySquare} link="/my_videos">
                My videos
            </SideNavButton>
        </VStack>
    );
}

export default SideNav;
