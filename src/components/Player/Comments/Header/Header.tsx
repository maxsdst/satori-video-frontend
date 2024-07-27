import { HStack, Text } from "@chakra-ui/react";
import Video from "../../../../entities/Video";
import { formatNumber } from "../../../../utils";
import SortMenu, { OnOrderingChange } from "./SortMenu";

interface Props {
    video: Video;
    onOrderingChange: OnOrderingChange;
}

function Header({ video, onOrderingChange }: Props) {
    return (
        <HStack justifyContent="space-between" width="100%">
            <HStack spacing={3} aria-label="Number of comments">
                <Text fontSize="lg" fontWeight="semibold">
                    Comments
                </Text>
                <Text>{formatNumber(video.comment_count)}</Text>
            </HStack>
            <SortMenu onOrderingChange={onOrderingChange} />
        </HStack>
    );
}

export default Header;
