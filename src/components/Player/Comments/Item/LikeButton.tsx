import { HStack, Text, useDisclosure } from "@chakra-ui/react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Comment from "../../../../entities/Comment";
import useCreateCommentLike from "../../../../hooks/comment_likes/useCreateCommentLike";
import useRemoveCommentLike from "../../../../hooks/comment_likes/useRemoveCommentLike";
import useIsAuthenticated from "../../../../hooks/useIsAuthenticated";
import { formatNumber } from "../../../../utils";
import IconButton from "../../../IconButton";
import LoginRequestModal from "../../../LoginRequestModal";

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

    const {
        isOpen: isLoginRequestModalOpen,
        onOpen: openLoginRequestModal,
        onClose: closeLoginRequestModal,
    } = useDisclosure();

    const isAuthenticated = useIsAuthenticated();

    if (isAuthenticated === undefined) return null;

    return (
        <>
            <HStack spacing={0}>
                <IconButton
                    icon={comment.is_liked ? AiFillHeart : AiOutlineHeart}
                    iconColor={comment.is_liked ? "red.500" : undefined}
                    label={comment.is_liked ? "Remove like" : "Like"}
                    size="sm"
                    onClick={() => {
                        if (!isAuthenticated) openLoginRequestModal();
                        else if (comment.is_liked)
                            removeCommentLike.mutate(null);
                        else createCommentLike.mutate(null);
                    }}
                />
                <Text aria-label="Number of likes" fontSize="xs" opacity={0.8}>
                    {formatNumber(comment.like_count)}
                </Text>
            </HStack>
            {!isAuthenticated && (
                <LoginRequestModal
                    isOpen={isLoginRequestModalOpen}
                    onClose={closeLoginRequestModal}
                    header="Want to like this comment?"
                >
                    Sign in to like this comment.
                </LoginRequestModal>
            )}
        </>
    );
}

export default LikeButton;
