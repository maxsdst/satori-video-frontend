import {
    Button,
    ButtonProps,
    Divider,
    Icon,
    IconProps,
    VStack,
} from "@chakra-ui/react";
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

function SideNav() {
    const buttonProps: ButtonProps = {
        variant: "ghost",
        width: "100%",
        justifyContent: "left",
        iconSpacing: 4,
    };

    const iconProps: IconProps = { boxSize: 6 };

    return (
        <VStack
            alignItems="start"
            padding={2}
            position={{ base: "absolute", md: "static" }}
            width="100%"
            maxWidth={{ base: "100%", md: "240px" }}
            backgroundColor="var(--chakra-colors-chakra-body-bg);"
        >
            <Button
                {...buttonProps}
                leftIcon={<Icon as={AiOutlineHome} {...iconProps} />}
            >
                Home
            </Button>
            <Button
                {...buttonProps}
                leftIcon={<Icon as={AiOutlineStar} {...iconProps} />}
            >
                Top
            </Button>
            <Button
                {...buttonProps}
                leftIcon={<Icon as={AiOutlineFire} {...iconProps} />}
            >
                Hot
            </Button>
            <Button
                {...buttonProps}
                leftIcon={<Icon as={AiOutlineClockCircle} {...iconProps} />}
            >
                Fresh
            </Button>
            <Divider />
            <Button
                {...buttonProps}
                leftIcon={<Icon as={MdOutlineSubscriptions} {...iconProps} />}
            >
                Subscriptions
            </Button>
            <Button
                {...buttonProps}
                leftIcon={<Icon as={HiOutlineBookmark} {...iconProps} />}
            >
                Saved
            </Button>
            <Button
                {...buttonProps}
                leftIcon={<Icon as={AiOutlineHistory} {...iconProps} />}
            >
                History
            </Button>
            <Button
                {...buttonProps}
                leftIcon={<Icon as={AiOutlinePlaySquare} {...iconProps} />}
            >
                My videos
            </Button>
        </VStack>
    );
}

export default SideNav;
