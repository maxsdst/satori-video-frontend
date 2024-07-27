import { Button, Icon, Spinner, VStack } from "@chakra-ui/react";
import {
    CSSProperties,
    Fragment,
    ReactElement,
    Ref,
    RefObject,
    forwardRef,
    useCallback,
    useContext,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import { BsArrowReturnRight } from "react-icons/bs";
import InfiniteScroll from "react-infinite-scroll-component";
import Comment from "../../../entities/Comment";
import useCachedComments from "../../../hooks/comments/useCachedComments";
import useComment from "../../../hooks/comments/useComment";
import useComments, { CommentQuery } from "../../../hooks/comments/useComments";
import PlayerContext from "../playerContext";
import EditCommentForm from "./EditCommentForm";
import { Ordering } from "./Header";
import Item from "./Item";

export interface CommentListHandle {
    addCreatedCommentId: (commentId: number) => void;
}

interface Props {
    videoId: number;
    parentId?: number;
    ordering: Ordering;
    pageSize: number;
    showFetchedComments: boolean;
    isReplyList: boolean;
    loadMoreTrigger: "button" | "scroll";
    loadMoreButtonText?: string;
    containerRef?: RefObject<HTMLElement>;
    styles?: CSSProperties;
}

const CommentList = forwardRef(
    (
        {
            videoId,
            parentId,
            ordering,
            pageSize,
            showFetchedComments,
            isReplyList,
            loadMoreTrigger,
            loadMoreButtonText,
            containerRef,
            styles,
        }: Props,
        ref: Ref<CommentListHandle>
    ) => {
        const { highlightedCommentId, highlightedCommentParentId } =
            useContext(PlayerContext);
        const isCommentHighlighted = !!highlightedCommentId;

        const { data: highlightedComment } = useComment(highlightedCommentId!, {
            enabled: isCommentHighlighted,
        });

        const { data: highlightedCommentParent } = useComment(
            highlightedCommentParentId!,
            {
                enabled: !!highlightedCommentParentId,
            }
        );

        const query = useMemo<CommentQuery>(() => {
            const queryOrdering: CommentQuery["ordering"] = (() => {
                if (isReplyList)
                    return { field: "creation_date", direction: "ASC" };

                switch (ordering) {
                    case "top":
                        return { field: "popularity_score", direction: "DESC" };
                    case "new":
                        return { field: "creation_date", direction: "DESC" };
                    default:
                        return undefined;
                }
            })();

            return {
                videoId,
                parentId,
                ordering: queryOrdering,
                pagination: { type: "cursor", pageSize },
            };
        }, [videoId, parentId, ordering, pageSize, isReplyList]);

        const {
            data: comments,
            isLoading,
            hasNextPage,
            fetchNextPage,
            isFetchingNextPage,
        } = useComments(query, { enabled: showFetchedComments });

        const [createdCommentIds, setCreatedCommentIds] = useState<number[]>(
            []
        );

        const createdComments = useCachedComments(createdCommentIds);

        const [editedCommentId, setEditedCommentId] = useState<number | null>(
            null
        );

        useImperativeHandle(ref, () => ({
            addCreatedCommentId: (commentId) =>
                isReplyList
                    ? setCreatedCommentIds([...createdCommentIds, commentId])
                    : setCreatedCommentIds([commentId, ...createdCommentIds]),
        }));

        function isInCreatedComments(comment: Comment) {
            return createdCommentIds.some(
                (commentId) => commentId === comment.id
            );
        }

        const onReplyToReplyCreated = useCallback(
            (comment: Comment) => {
                setCreatedCommentIds([...createdCommentIds, comment.id]);
            },
            [createdCommentIds, setCreatedCommentIds]
        );

        const onEditComment = useCallback(
            (comment: Comment) => setEditedCommentId(comment.id),
            [setEditedCommentId]
        );

        const onCommentDeleted = useCallback(
            (comment: Comment) => {
                setCreatedCommentIds(
                    createdCommentIds.filter(
                        (commentId) => commentId !== comment.id
                    )
                );
            },
            [createdCommentIds, setCreatedCommentIds]
        );

        function renderComment(comment: Comment, isHighlighted?: boolean) {
            if (comment.id === editedCommentId)
                return (
                    <EditCommentForm
                        key={comment.id}
                        comment={comment}
                        isReply={isReplyList}
                        onCommentEdited={() => setEditedCommentId(null)}
                        onClose={() => setEditedCommentId(null)}
                    />
                );
            return (
                <Item
                    key={comment.id}
                    comment={comment}
                    isReply={isReplyList}
                    onReplyToReplyCreated={onReplyToReplyCreated}
                    onEdit={onEditComment}
                    onDeleted={onCommentDeleted}
                    isHighlighted={isHighlighted}
                />
            );
        }

        function renderCreatedComments() {
            return createdComments.map(
                (comment) => comment && renderComment(comment)
            );
        }

        function renderHighlightedComment() {
            if (!isCommentHighlighted || !highlightedComment) return null;
            if (!isReplyList) {
                if (highlightedComment.parent) {
                    if (!highlightedCommentParent) return null;
                    return renderComment(highlightedCommentParent, false);
                }
                return renderComment(highlightedComment, true);
            }
            if (isReplyList) {
                if (parentId === highlightedComment.parent)
                    return renderComment(highlightedComment, true);
            }
            return null;
        }

        function renderComments() {
            return (
                <>
                    {renderHighlightedComment()}
                    {!isReplyList && renderCreatedComments()}
                    {showFetchedComments &&
                        comments?.pages.map((page, index) => (
                            <Fragment key={index}>
                                {page.results.map((comment) => {
                                    if (isInCreatedComments(comment))
                                        return null;
                                    if (
                                        comment.id === highlightedCommentId ||
                                        comment.id ===
                                            highlightedCommentParentId
                                    )
                                        return null;
                                    return renderComment(comment);
                                })}
                            </Fragment>
                        ))}
                    {isReplyList && renderCreatedComments()}
                </>
            );
        }

        if (
            loadMoreTrigger === "button" &&
            typeof loadMoreButtonText === "undefined"
        )
            throw `loadMoreButtonText prop must be passed when loadMoreTrigger is "button"`;
        if (loadMoreTrigger === "scroll" && typeof containerRef === "undefined")
            throw `containerRef prop must be passed when loadMoreTrigger is "scroll"`;

        if (loadMoreTrigger === "button")
            return (
                <VStack
                    aria-label={isReplyList ? "Replies" : "Comments"}
                    as="ul"
                    width="100%"
                    display={
                        showFetchedComments ||
                        createdComments.length > 0 ||
                        (isCommentHighlighted &&
                            parentId === highlightedComment?.parent)
                            ? "flex"
                            : "none"
                    }
                    style={{ ...styles }}
                >
                    {renderComments()}
                    {showFetchedComments &&
                        !isFetchingNextPage &&
                        hasNextPage && (
                            <Button
                                variant="ghost"
                                size="sm"
                                borderRadius="18px"
                                leftIcon={
                                    <Icon as={BsArrowReturnRight} boxSize={5} />
                                }
                                onClick={() => void fetchNextPage()}
                            >
                                {loadMoreButtonText}
                            </Button>
                        )}
                    {isFetchingNextPage && <Spinner />}
                </VStack>
            );

        if (!containerRef?.current) return null;

        const fetchedCommentCount =
            comments?.pages.reduce(
                (count, page) => page.results.length + count,
                0
            ) || 0;

        const totalItems =
            (hasNextPage ? 1 : 0) + // spinner
            createdComments.length +
            fetchedCommentCount;

        return (
            <InfiniteScroll
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={null}
                dataLength={totalItems}
                scrollableTarget={
                    containerRef.current as unknown as ReactElement
                }
                scrollThreshold="50px"
            >
                <VStack
                    aria-label={isReplyList ? "Replies" : "Comments"}
                    as="ul"
                    alignItems="center"
                    width="100%"
                    style={{ ...styles }}
                >
                    {renderComments()}
                    {(hasNextPage || isLoading) && (
                        <Spinner
                            role="progressbar"
                            aria-label="Loading comments"
                        />
                    )}
                </VStack>
            </InfiniteScroll>
        );
    }
);

export default CommentList;
