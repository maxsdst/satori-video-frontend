import {
    Avatar,
    Badge,
    Box,
    Button,
    Link as ChakraLink,
    HStack,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import { formatDistanceToNowStrict } from "date-fns";
import { memo, useRef } from "react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { Link } from "react-router-dom";
import Comment from "../../../../entities/Comment";
import useIsAuthenticated from "../../../../hooks/useIsAuthenticated";
import ExpandableText from "../../../ExpandableText";
import LoginRequestModal from "../../../LoginRequestModal";
import CommentList, { CommentListHandle } from "../CommentList";
import ActionMenu from "./ActionMenu";
import CreateReplyForm from "./CreateReplyForm";
import LikeButton from "./LikeButton";

interface Props {
    comment: Comment;
    isReply?: boolean;
    onReplyToReplyCreated?: (reply: Comment) => void;
    onEdit: (comment: Comment) => void;
    onDeleted: (comment: Comment) => void;
    isHighlighted?: boolean;
}

function Item({
    comment,
    isReply,
    onReplyToReplyCreated,
    onEdit,
    onDeleted,
    isHighlighted,
}: Props) {
    const {
        isOpen: isReplyFormOpen,
        onOpen: openReplyForm,
        onClose: closeReplyForm,
    } = useDisclosure();

    const { isOpen: areRepliesOpen, onToggle: toggleReplies } = useDisclosure();

    const commentList = useRef<CommentListHandle>(null);

    const {
        isOpen: isLoginRequestModalOpen,
        onOpen: openLoginRequestModal,
        onClose: closeLoginRequestModal,
    } = useDisclosure();

    const isAuthenticated = useIsAuthenticated();

    if (isAuthenticated === undefined) return null;

    return (
        <>
            <VStack
                as="li"
                aria-label={
                    isHighlighted
                        ? isReply
                            ? "Highlighted reply"
                            : "Highlighted comment"
                        : undefined
                }
                alignItems="start"
                width="100%"
            >
                {isHighlighted && (
                    <Badge role="status">
                        {isReply ? "Highlighted reply" : "Highlighted comment"}
                    </Badge>
                )}
                <HStack alignItems="start" spacing={2} width="100%">
                    <Link to={"/users/" + comment.profile.user.username}>
                        <Avatar
                            aria-label="Author's avatar"
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
                            <VStack
                                alignItems="start"
                                spacing={1}
                                marginLeft={2}
                            >
                                <HStack alignItems="end">
                                    <Link
                                        to={
                                            "/users/" +
                                            comment.profile.user.username
                                        }
                                    >
                                        <Text
                                            aria-label="Author's username"
                                            fontSize="sm"
                                            fontWeight="semibold"
                                        >
                                            @{comment.profile.user.username}
                                        </Text>
                                    </Link>
                                    <Text
                                        aria-label="Date"
                                        fontSize="xs"
                                        opacity={0.8}
                                    >
                                        {formatDistanceToNowStrict(
                                            comment.creation_date
                                        )}{" "}
                                        ago
                                    </Text>
                                </HStack>
                                <ExpandableText
                                    ariaLabel="Content"
                                    noOfLines={4}
                                    fontSize="sm"
                                    expandButtonSize="sm"
                                >
                                    {comment.mentioned_profile_username &&
                                        (comment.mentioned_profile ? (
                                            <ChakraLink
                                                aria-label="Mentioned user"
                                                as={Link}
                                                color="blue.200"
                                                _hover={{ cursor: "pointer" }}
                                                to={
                                                    "/users/" +
                                                    comment.mentioned_profile_username
                                                }
                                            >
                                                @
                                                {
                                                    comment.mentioned_profile_username
                                                }{" "}
                                            </ChakraLink>
                                        ) : (
                                            <Text
                                                aria-label="Mentioned user"
                                                as="span"
                                            >
                                                @
                                                {
                                                    comment.mentioned_profile_username
                                                }{" "}
                                            </Text>
                                        ))}
                                    <Text as="span">{comment.text}</Text>
                                </ExpandableText>
                            </VStack>
                            <ActionMenu
                                comment={comment}
                                onEdit={() => onEdit(comment)}
                                onDeleted={() => onDeleted(comment)}
                            />
                        </HStack>
                        <HStack spacing={4}>
                            <LikeButton comment={comment} />
                            <Button
                                variant="ghost"
                                size="sm"
                                fontSize="xs"
                                borderRadius="18px"
                                onClick={() =>
                                    isAuthenticated
                                        ? openReplyForm()
                                        : openLoginRequestModal()
                                }
                            >
                                Reply
                            </Button>
                        </HStack>
                        {isReplyFormOpen && (
                            <Box width="100%" marginTop={2} marginLeft={2}>
                                <CreateReplyForm
                                    comment={comment}
                                    onReplyCreated={(reply) =>
                                        isReply
                                            ? onReplyToReplyCreated?.(reply)
                                            : commentList.current?.addCreatedCommentId(
                                                  reply.id
                                              )
                                    }
                                    onClose={closeReplyForm}
                                />
                            </Box>
                        )}
                        {comment.reply_count > 0 && (
                            <Button
                                aria-label="Open replies"
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
                            ordering="new"
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
            </VStack>
            {!isAuthenticated && (
                <LoginRequestModal
                    isOpen={isLoginRequestModalOpen}
                    onClose={closeLoginRequestModal}
                    header="Want to reply to this comment?"
                >
                    Sign in to reply to this comment.
                </LoginRequestModal>
            )}
        </>
    );
}

export default memo(Item);
