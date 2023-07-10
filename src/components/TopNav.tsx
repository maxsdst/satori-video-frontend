import { HStack, Icon, Image } from "@chakra-ui/react";
import { RxHamburgerMenu } from "react-icons/rx";
import SearchInput from "./SearchInput";

function TopNav() {
    return (
        <HStack padding={2}>
            <Icon as={RxHamburgerMenu} boxSize="24px" marginX={2} />
            <Image src={""} boxSize="40px" />
            <SearchInput />
        </HStack>
    );
}

export default TopNav;
