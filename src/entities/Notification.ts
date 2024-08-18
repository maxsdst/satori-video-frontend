import { DateFields } from "../services/ApiClient";
import Comment, { DATE_FIELDS as COMMENT_DATE_FIELDS } from "./Comment";
import Profile from "./Profile";
import Video, { DATE_FIELDS as VIDEO_DATE_FIELDS } from "./Video";

interface BaseNotification {
    id: number;
    profile: number;
    creation_date: Date;
    is_seen: boolean;
}

export interface ProfileNotification extends BaseNotification {
    type: "profile";
    subtype: "new_follower";
    related_profile: Profile;
}

export interface VideoNotification extends BaseNotification {
    type: "video";
    subtype: "upload_processed" | "comment" | "followed_profile_video";
    video: Video;
    comment: Comment;
}

export interface CommentNotification extends BaseNotification {
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

export const DATE_FIELDS: DateFields<Notification> = {
    own: ["creation_date"],
    nested: {
        video: VIDEO_DATE_FIELDS,
        comment: COMMENT_DATE_FIELDS,
        reply: COMMENT_DATE_FIELDS,
    },
};
