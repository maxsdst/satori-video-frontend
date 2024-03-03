import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Video from "../../../entities/Video";
import useCreateLike from "../../../hooks/useCreateLike";
import useRemoveLike from "../../../hooks/useRemoveLike";
import { formatNumber } from "../../../utils";
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

    return (
        <PlayerButton
            icon={video.is_liked ? AiFillHeart : AiOutlineHeart}
            iconColor={video.is_liked ? "red.500" : undefined}
            onClick={() =>
                video.is_liked
                    ? removeLike.mutate(null)
                    : createLike.mutate(null)
            }
        >
            {formatNumber(video.like_count)}
        </PlayerButton>
    );
}

export default LikeButton;
