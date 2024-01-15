import { Button, Icon, Spinner, VStack } from "@chakra-ui/react";
import {
    CSSProperties,
    Fragment,
    ReactElement,
    Ref,
    RefObject,
    forwardRef,
    useImperativeHandle,
    useState,
} from "react";
import { BsArrowReturnRight } from "react-icons/bs";
import InfiniteScroll from "react-infinite-scroll-component";
import Comment from "../../../entities/Comment";
import useComments, {
    CommentQuery,
    useHandleCommentDeleted,
    useHandleCommentUpdated,
} from "../../../hooks/useComments";
import EditCommentForm from "./EditCommentForm";
import { Ordering } from "./Header";
import Item from "./Item";

export interface CommentListHandle {
    addCreatedComment: (comment: Comment) => void;
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
        const queryOrdering: CommentQuery["ordering"] = (() => {
            switch (ordering) {
                case "top":
                    return { field: "popularity_score", direction: "DESC" };
                case "new":
                    return { field: "creation_date", direction: "DESC" };
                default:
                    return undefined;
            }
        })();

        const query: CommentQuery = {
            videoId,
            parentId,
            ordering: queryOrdering,
        };

        const {
            data: comments,
            isLoading,
            hasNextPage,
            fetchNextPage,
            isFetchingNextPage,
        } = useComments(query, { pageSize, enabled: showFetchedComments });

        const handleCommentUpdated = useHandleCommentUpdated(query);
        const handleCommentDeleted = useHandleCommentDeleted(query);

        const [createdComments, setCreatedComments] = useState<Comment[]>([]);
        const [editedCommentId, setEditedCommentId] = useState<number | null>(
            null
        );

        useImperativeHandle(ref, () => ({
            addCreatedComment: (comment) =>
                isReplyList
                    ? setCreatedComments([...createdComments, comment])
                    : setCreatedComments([comment, ...createdComments]),
        }));

        function _handleCommentUpdated(comment: Comment) {
            handleCommentUpdated(comment);
            setCreatedComments(
                createdComments.map((item) =>
                    item.id === comment.id ? comment : item
                )
            );
        }

        function _handleCommentDeleted(commentId: number) {
            handleCommentDeleted(commentId);
            setCreatedComments(
                createdComments.filter((item) => item.id !== commentId)
            );
        }

        function isInCreatedComments(comment: Comment) {
            return createdComments.some((item) => item.id === comment.id);
        }

        function renderComment(comment: Comment) {
            if (comment.id === editedCommentId)
                return (
                    <EditCommentForm
                        comment={comment}
                        isReply={isReplyList}
                        onCommentEdited={(comment) => {
                            setEditedCommentId(null);
                            _handleCommentUpdated(comment);
                        }}
                        onClose={() => setEditedCommentId(null)}
                    />
                );
            return (
                <Item
                    key={comment.id}
                    comment={comment}
                    isReply={isReplyList}
                    onReplyToReplyCreated={(comment) =>
                        setCreatedComments([...createdComments, comment])
                    }
                    onEdit={() => setEditedCommentId(comment.id)}
                    onDeleted={() => {
                        _handleCommentDeleted(comment.id);
                    }}
                />
            );
        }

        function renderCreatedComments() {
            return createdComments.map((comment) => renderComment(comment));
        }

        function renderComments() {
            return (
                <>
                    {!isReplyList && renderCreatedComments()}
                    {showFetchedComments &&
                        comments?.pages.map((page, index) => (
                            <Fragment key={index}>
                                {page.results.map((comment) => {
                                    if (isInCreatedComments(comment))
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
                    width="100%"
                    display={
                        !showFetchedComments && createdComments.length === 0
                            ? "none"
                            : "flex"
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
                                onClick={() => fetchNextPage()}
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
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    ...styles,
                }}
            >
                {renderComments()}
                {(hasNextPage || isLoading) && <Spinner />}
            </InfiniteScroll>
        );
    }
);

export default CommentList;
