import { Box, Divider, Flex } from "@chakra-ui/react";
import { useRef, useState } from "react";
import Video from "../../../entities/Video";
import AdaptivePanel from "../AdaptivePanel";
import CommentList, { CommentListHandle } from "./CommentList";
import CreateCommentForm from "./CreateCommentForm";
import Header, { Ordering } from "./Header";

interface Props {
    video: Video;
    onClose: () => void;
}

function Comments({ video, onClose }: Props) {
    const commentListContainer = useRef<HTMLDivElement>(null);
    const commentList = useRef<CommentListHandle>(null);

    const [ordering, setOrdering] = useState<Ordering>("top");

    return (
        <AdaptivePanel
            onClose={onClose}
            header={<Header video={video} onOrderingChange={setOrdering} />}
        >
            <Flex
                direction="column-reverse"
                justifyContent="flex-start"
                width="100%"
                height="100%"
                overflow="hidden"
            >
                <Box width="100%">
                    <Divider orientation="horizontal" />
                    <Box width="100%" paddingX={4} paddingY={2}>
                        <CreateCommentForm
                            videoId={video.id}
                            onCommentCreated={(comment) =>
                                commentList.current?.addCreatedComment(comment)
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
                        ordering={ordering}
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
        </AdaptivePanel>
    );
}

export default Comments;
