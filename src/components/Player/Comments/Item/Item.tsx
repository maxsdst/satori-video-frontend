import {
    Avatar,
    Box,
    Button,
    HStack,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import { formatDistanceToNowStrict } from "date-fns";
import { useRef } from "react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { Link } from "react-router-dom";
import Comment from "../../../../entities/Comment";
import ExpandableText from "../../../ExpandableText";
import CommentList, { CommentListHandle } from "../CommentList";
import ActionMenu from "./ActionMenu";
import CreateReplyForm from "./CreateReplyForm";
import LikeButton from "./LikeButton";

interface Props {
    comment: Comment;
    isReply?: boolean;
    onEdit: () => void;
    onDeleted: () => void;
}

function Item({ comment, isReply, onEdit, onDeleted }: Props) {
    const {
        isOpen: isReplyFormOpen,
        onOpen: openReplyForm,
        onClose: closeReplyForm,
    } = useDisclosure();

    const { isOpen: areRepliesOpen, onToggle: toggleReplies } = useDisclosure();

    const commentList = useRef<CommentListHandle>(null);

    return (
        <HStack alignItems="start" spacing={2} width="100%">
            <Link to={"/users/" + comment.profile.user.username}>
                <Avatar
                    size={isReply ? "sm" : "md"}
                    _hover={{ cursor: "pointer" }}
                    src={comment.profile.avatar || undefined}
                />
            </Link>
            <VStack alignItems="start" spacing={1} width="100%">
                <HStack
                    width="100%"
                    justifyContent="space-between"
                    alignItems="start"
                >
                    <VStack alignItems="start" spacing={1} marginLeft={2}>
                        <HStack alignItems="end">
                            <Link
                                to={"/users/" + comment.profile.user.username}
                            >
                                <Text fontSize="sm" fontWeight="semibold">
                                    @{comment.profile.user.username}
                                </Text>
                            </Link>
                            <Text fontSize="xs" opacity={0.8}>
                                {formatDistanceToNowStrict(
                                    comment.creation_date
                                )}{" "}
                                ago
                            </Text>
                        </HStack>
                        <ExpandableText
                            noOfLines={4}
                            fontSize="sm"
                            expandButtonSize="sm"
                        >
                            {comment.text}
                        </ExpandableText>
                    </VStack>
                    <ActionMenu
                        comment={comment}
                        onEdit={onEdit}
                        onDeleted={onDeleted}
                    />
                </HStack>
                <HStack spacing={4}>
                    <LikeButton comment={comment} />
                    <Button
                        variant="ghost"
                        size="sm"
                        fontSize="xs"
                        borderRadius="18px"
                        onClick={openReplyForm}
                    >
                        Reply
                    </Button>
                </HStack>
                {isReplyFormOpen && (
                    <Box width="100%" marginTop={2} marginLeft={2}>
                        <CreateReplyForm
                            comment={comment}
                            onReplyCreated={(reply) =>
                                commentList.current?.addCreatedComment(reply)
                            }
                            onClose={closeReplyForm}
                        />
                    </Box>
                )}
                {comment.reply_count > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        borderRadius="18px"
                        leftIcon={
                            areRepliesOpen ? (
                                <AiFillCaretUp />
                            ) : (
                                <AiFillCaretDown />
                            )
                        }
                        onClick={toggleReplies}
                    >
                        {comment.reply_count}{" "}
                        {comment.reply_count > 1 ? "replies" : "reply"}
                    </Button>
                )}
                <CommentList
                    ref={commentList}
                    videoId={comment.video}
                    parentId={comment.id}
                    pageSize={10}
                    showFetchedComments={areRepliesOpen}
                    isReplyList={true}
                    loadMoreTrigger="button"
                    loadMoreButtonText="Show more replies"
                    styles={{
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                    }}
                />
            </VStack>
        </HStack>
    );
}

export default Item;
