import { HStack, Text } from "@chakra-ui/react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Comment from "../../../../entities/Comment";
import useCreateCommentLike from "../../../../hooks/comment_likes/useCreateCommentLike";
import useRemoveCommentLike from "../../../../hooks/comment_likes/useRemoveCommentLike";
import { formatNumber } from "../../../../utils";
import IconButton from "../../../IconButton";

interface Props {
    comment: Comment;
}

function LikeButton({ comment }: Props) {
    const createCommentLike = useCreateCommentLike(comment.id, {
        shouldUpdateCommentOptimistically: true,
    });
    const removeCommentLike = useRemoveCommentLike(comment.id, {
        shouldUpdateCommentOptimistically: true,
    });

    return (
        <HStack spacing={0}>
            <IconButton
                icon={comment.is_liked ? AiFillHeart : AiOutlineHeart}
                iconColor={comment.is_liked ? "red.500" : undefined}
                label="Like"
                size="sm"
                onClick={() =>
                    comment.is_liked
                        ? removeCommentLike.mutate(null)
                        : createCommentLike.mutate(null)
                }
            />
            <Text fontSize="xs" opacity={0.8}>
                {formatNumber(comment.like_count)}
            </Text>
        </HStack>
    );
}

export default LikeButton;
