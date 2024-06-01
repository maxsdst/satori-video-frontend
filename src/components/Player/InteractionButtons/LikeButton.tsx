import { useDisclosure } from "@chakra-ui/react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Video from "../../../entities/Video";
import useCreateEvent, {
    EventType,
} from "../../../hooks/events/useCreateEvent";
import useCreateLike from "../../../hooks/likes/useCreateLike";
import useRemoveLike from "../../../hooks/likes/useRemoveLike";
import useIsAuthenticated from "../../../hooks/useIsAuthenticated";
import { formatNumber } from "../../../utils";
import LoginRequestModal from "../../LoginRequestModal";
import PlayerButton from "../PlayerButton";

interface Props {
    video: Video;
}

function LikeButton({ video }: Props) {
    const createLike = useCreateLike(video.id, {
        shouldUpdateVideoOptimistically: true,
    });
    const removeLike = useRemoveLike(video.id, {
        shouldUpdateVideoOptimistically: true,
    });

    const createEvent = useCreateEvent({});

    const {
        isOpen: isLoginRequestModalOpen,
        onOpen: openLoginRequestModal,
        onClose: closeLoginRequestModal,
    } = useDisclosure();

    const isAuthenticated = useIsAuthenticated();

    if (isAuthenticated === undefined) return null;

    return (
        <>
            <PlayerButton
                icon={video.is_liked ? AiFillHeart : AiOutlineHeart}
                iconColor={video.is_liked ? "red.500" : undefined}
                onClick={() => {
                    if (!isAuthenticated) openLoginRequestModal();
                    else if (video.is_liked) removeLike.mutate(null);
                    else {
                        createLike.mutate(null);
                        createEvent.mutate({
                            videoId: video.id,
                            type: EventType.LIKE,
                        });
                    }
                }}
            >
                {formatNumber(video.like_count)}
            </PlayerButton>
            {!isAuthenticated && (
                <LoginRequestModal
                    isOpen={isLoginRequestModalOpen}
                    onClose={closeLoginRequestModal}
                    header="Want to like this video?"
                >
                    Sign in to like this video.
                </LoginRequestModal>
            )}
        </>
    );
}

export default LikeButton;
