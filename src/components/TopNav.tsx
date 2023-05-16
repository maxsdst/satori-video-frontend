import { Image, HStack, Icon } from "@chakra-ui/react";
import { RxHamburgerMenu } from "react-icons/rx";

function TopNav() {
    return (
        <HStack padding={2}>
            <Icon as={RxHamburgerMenu} boxSize="24px" marginX={2} />
            <Image src={""} boxSize="40px" />
        </HStack>
    );
}

export default TopNav;
