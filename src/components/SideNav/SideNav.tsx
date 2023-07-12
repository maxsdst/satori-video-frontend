import { Divider, VStack } from "@chakra-ui/react";
import {
    AiOutlineClockCircle,
    AiOutlineFire,
    AiOutlineHistory,
    AiOutlineHome,
    AiOutlinePlaySquare,
    AiOutlineStar,
} from "react-icons/ai";
import { HiOutlineBookmark } from "react-icons/hi";
import { MdOutlineSubscriptions } from "react-icons/md";
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
            <SideNavButton icon={AiOutlineHome}>Home</SideNavButton>
            <SideNavButton icon={AiOutlineStar}>Top</SideNavButton>
            <SideNavButton icon={AiOutlineFire}>Hot</SideNavButton>
            <SideNavButton icon={AiOutlineClockCircle}>Fresh</SideNavButton>
            <Divider />
            <SideNavButton icon={MdOutlineSubscriptions}>
                Subscriptions
            </SideNavButton>
            <SideNavButton icon={HiOutlineBookmark}>Saved</SideNavButton>
            <SideNavButton icon={AiOutlineHistory}>History</SideNavButton>
            <SideNavButton icon={AiOutlinePlaySquare}>My videos</SideNavButton>
        </VStack>
    );
}

export default SideNav;
