import Comment from "./Comment";
import Profile from "./Profile";
import Video from "./Video";

interface BaseNotification {
    id: number;
    profile: number;
    creation_date: Date;
    is_seen: boolean;
}

interface ProfileNotification extends BaseNotification {
    type: "profile";
    subtype: "new_follower";
    related_profile: Profile;
}

interface VideoNotification extends BaseNotification {
    type: "video";
    subtype: "upload_processed" | "comment" | "followed_profile_video";
    video: Video;
    comment: Comment;
}

interface CommentNotification extends BaseNotification {
    type: "comment";
    subtype: "like" | "reply";
    video: Video;
    comment: Comment;
    reply: Comment;
}

type Notification =
    | ProfileNotification
    | VideoNotification
    | CommentNotification;

export default Notification;

export const DATE_FIELDS = ["creation_date"];
