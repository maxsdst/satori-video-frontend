import { useEffect, useReducer } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Video from "../../../../entities/Video";
import useCreateLike from "../../../../hooks/useCreateLike";
import useRemoveLike from "../../../../hooks/useRemoveLike";
import { formatNumber } from "../../../../utils";
import PlayerButton from "../../PlayerButton";
import likeReducer from "./likeReducer";

interface Props {
    video: Video;
    refetchVideo: () => void;
}

function LikeButton({ video, refetchVideo }: Props) {
    const createLike = useCreateLike({});
    const removeLike = useRemoveLike(video.id);

    const [{ isLiked, likeCount }, dispatch] = useReducer(likeReducer, {
        isLiked: video.is_liked,
        likeCount: video.like_count,
    });

    useEffect(() => {
        dispatch({
            type: "UPDATE_STATE",
            state: { isLiked: video.is_liked, likeCount: video.like_count },
        });
    }, [video]);

    return (
        <PlayerButton
            icon={isLiked ? AiFillHeart : AiOutlineHeart}
            iconColor={isLiked ? "red.500" : undefined}
            onClick={() => {
                if (!isLiked) {
                    dispatch({ type: "CREATE_LIKE" });
                    createLike.mutate(
                        { videoId: video.id },
                        {
                            onSuccess: refetchVideo,
                            onError: () => dispatch({ type: "REMOVE_LIKE" }),
                        }
                    );
                } else {
                    dispatch({ type: "REMOVE_LIKE" });
                    removeLike.mutate(null, {
                        onSuccess: refetchVideo,
                        onError: () => dispatch({ type: "CREATE_LIKE" }),
                    });
                }
            }}
        >
            {formatNumber(likeCount)}
        </PlayerButton>
    );
}

export default LikeButton;
