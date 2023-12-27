import { Box, Divider, Flex, Portal, VStack } from "@chakra-ui/react";
import { useRef } from "react";
import Video from "../../../entities/Video";
import CommentList, { CommentListHandle } from "./CommentList";
import CreateCommentForm from "./CreateCommentForm";
import Header from "./Header";

interface Props {
    video: Video;
    onClose: () => void;
    width: string;
    height: string;
    minHeight?: string;
    isFullscreen: boolean;
    borderRadius: string;
}

function Comments({
    video,
    onClose,
    width,
    height,
    minHeight,
    isFullscreen,
    borderRadius,
}: Props) {
    const commentListContainer = useRef<HTMLDivElement>(null);
    const commentList = useRef<CommentListHandle>(null);

    const headerHeight = "3rem";

    const comments = (
        <Box
            width={width}
            height={height}
            minHeight={minHeight}
            backgroundColor="gray.700"
            position={isFullscreen ? "fixed" : "relative"}
            top={isFullscreen ? 0 : undefined}
            zIndex={2}
            borderRightRadius={!isFullscreen ? borderRadius : undefined}
            onTouchStartCapture={(e) => e.stopPropagation()}
        >
            <VStack spacing={0}>
                <Header video={video} onClose={onClose} height={headerHeight} />
                <Flex
                    direction="column-reverse"
                    justifyContent="flex-start"
                    width="100%"
                    height={`calc(${height} - ${headerHeight})`}
                    overflow="hidden"
                >
                    <Box width="100%">
                        <Divider orientation="horizontal" />
                        <Box width="100%" paddingX={4} paddingY={2}>
                            <CreateCommentForm
                                videoId={video.id}
                                onCommentCreated={(comment) =>
                                    commentList.current?.addCreatedComment(
                                        comment
                                    )
                                }
                            />
                        </Box>
                    </Box>
                    <Box
                        ref={commentListContainer}
                        width="100%"
                        overflowY="auto"
                        flexGrow={1}
                        flexShrink={1}
                        onWheelCapture={(e) => e.stopPropagation()}
                    >
                        <CommentList
                            ref={commentList}
                            videoId={video.id}
                            pageSize={20}
                            showFetchedComments={true}
                            isReplyList={false}
                            loadMoreTrigger="scroll"
                            containerRef={commentListContainer}
                            styles={{
                                paddingLeft: "1.25rem",
                                paddingRight: "1.25rem",
                                paddingTop: "0.5rem",
                                paddingBottom: "0.5rem",
                                gap: "1.25rem",
                            }}
                        />
                    </Box>
                </Flex>
            </VStack>
        </Box>
    );

    if (isFullscreen) return <Portal>{comments}</Portal>;

    return comments;
}

export default Comments;
