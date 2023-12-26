import { HStack, Text } from "@chakra-ui/react";
import { useEffect, useReducer } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Comment from "../../../../entities/Comment";
import useCreateCommentLike from "../../../../hooks/useCreateCommentLike";
import useRemoveCommentLike from "../../../../hooks/useRemoveCommentLike";
import likeReducer from "../../../../reducers/likeReducer";
import { formatNumber } from "../../../../utils";
import IconButton from "../../../IconButton";

interface Props {
    comment: Comment;
}

function LikeButton({ comment }: Props) {
    const createCommentLike = useCreateCommentLike({});
    const removeCommentLike = useRemoveCommentLike(comment.id);

    const [{ isLiked, likeCount }, dispatch] = useReducer(likeReducer, {
        isLiked: comment.is_liked,
        likeCount: comment.like_count,
    });

    useEffect(() => {
        dispatch({
            type: "UPDATE_STATE",
            state: { isLiked: comment.is_liked, likeCount: comment.like_count },
        });
    }, [comment]);

    return (
        <HStack spacing={0}>
            <IconButton
                icon={isLiked ? AiFillHeart : AiOutlineHeart}
                iconColor={isLiked ? "red.500" : undefined}
                label="Like"
                size="sm"
                onClick={() => {
                    if (!isLiked) {
                        dispatch({ type: "CREATE_LIKE" });
                        createCommentLike.mutate(
                            { commentId: comment.id },
                            {
                                onError: () =>
                                    dispatch({ type: "REMOVE_LIKE" }),
                            }
                        );
                    } else {
                        dispatch({ type: "REMOVE_LIKE" });
                        removeCommentLike.mutate(null, {
                            onError: () => dispatch({ type: "CREATE_LIKE" }),
                        });
                    }
                }}
            />
            <Text fontSize="xs" opacity={0.8}>
                {formatNumber(likeCount)}
            </Text>
        </HStack>
    );
}

export default LikeButton;
