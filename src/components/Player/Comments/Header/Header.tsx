import { HStack, Text } from "@chakra-ui/react";
import { MdOutlineClose } from "react-icons/md";
import Video from "../../../../entities/Video";
import { formatNumber } from "../../../../utils";
import IconButton from "../../../IconButton";
import SortMenu, { OnOrderingChange } from "./SortMenu";

interface Props {
    video: Video;
    onOrderingChange: OnOrderingChange;
    onClose: () => void;
    height: string;
}

function Header({ video, onOrderingChange, onClose, height }: Props) {
    return (
        <HStack
            justifyContent="space-between"
            width="100%"
            height={height}
            paddingLeft={5}
            paddingRight={1}
            paddingY={1}
        >
            <HStack spacing={3}>
                <Text fontSize="lg" fontWeight="semibold">
                    Comments
                </Text>
                <Text>{formatNumber(video.comment_count)}</Text>
            </HStack>
            <HStack spacing={0}>
                <SortMenu onOrderingChange={onOrderingChange} />
                <IconButton
                    icon={MdOutlineClose}
                    label="Close"
                    onClick={onClose}
                />
            </HStack>
        </HStack>
    );
}

export default Header;
