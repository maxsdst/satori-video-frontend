import { AiFillCheckCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import Notification from "../../../entities/Notification";
import Content from "./Content";

interface Props {
    notification: Notification;
}

function NotificationItem({ notification }: Props) {
    const navigate = useNavigate();

    switch (notification.type) {
        case "profile":
            switch (notification.subtype) {
                case "new_follower":
                    return (
                        <Content
                            notification={notification}
                            avatar={notification.related_profile.avatar}
                            username={
                                notification.related_profile.user.username
                            }
                            text="is now following you."
                            onClick={() =>
                                navigate(
                                    "/users/" +
                                        notification.related_profile.user
                                            .username
                                )
                            }
                        />
                    );
            }
        case "video":
            switch (notification.subtype) {
                case "upload_processed":
                    return (
                        <Content
                            notification={notification}
                            showIcon={true}
                            icon={AiFillCheckCircle}
                            text={`Your video upload "${notification.video.title}" is complete.`}
                            videoThumbnail={notification.video.thumbnail}
                            onClick={() =>
                                navigate("/uploads", {
                                    state: {
                                        editedVideoId: notification.video.id,
                                    },
                                })
                            }
                        />
                    );
                case "comment":
                    return (
                        <Content
                            notification={notification}
                            avatar={notification.comment.profile.avatar}
                            username={
                                notification.comment.profile.user.username
                            }
                            text={`commented on your video: ${notification.comment.text}`}
                            videoThumbnail={notification.video.thumbnail}
                            onClick={() =>
                                navigate("/videos/" + notification.video.id, {
                                    state: {
                                        highlightedCommentId:
                                            notification.comment.id,
                                        highlightedCommentParentId:
                                            notification.comment.parent,
                                    },
                                })
                            }
                        />
                    );
                case "followed_profile_video":
                    return (
                        <Content
                            notification={notification}
                            avatar={notification.video.profile.avatar}
                            username={notification.video.profile.user.username}
                            text={`uploaded new video: ${notification.video.title}`}
                            videoThumbnail={notification.video.thumbnail}
                            onClick={() =>
                                navigate("/videos/" + notification.video.id)
                            }
                        />
                    );
            }
        case "comment":
            switch (notification.subtype) {
                case "like":
                    return (
                        <Content
                            notification={notification}
                            avatar={null}
                            text={`Someone liked your comment "${notification.comment.text}"`}
                            videoThumbnail={notification.video.thumbnail}
                            onClick={() =>
                                navigate("/videos/" + notification.video.id, {
                                    state: {
                                        highlightedCommentId:
                                            notification.comment.id,
                                        highlightedCommentParentId:
                                            notification.comment.parent,
                                    },
                                })
                            }
                        />
                    );
                case "reply":
                    return (
                        <Content
                            notification={notification}
                            avatar={notification.reply.profile.avatar}
                            username={notification.reply.profile.user.username}
                            text={`replied to your comment: ${notification.reply.text}`}
                            videoThumbnail={notification.video.thumbnail}
                            onClick={() =>
                                navigate("/videos/" + notification.video.id, {
                                    state: {
                                        highlightedCommentId:
                                            notification.reply.id,
                                        highlightedCommentParentId:
                                            notification.reply.parent,
                                    },
                                })
                            }
                        />
                    );
            }
    }
}

export default NotificationItem;
