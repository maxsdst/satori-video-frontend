import Comment from "../../src/entities/Comment";
import Profile from "../../src/entities/Profile";
import Video from "../../src/entities/Video";
import {
    CommentReportReason,
    EventType,
    ReportReason,
    db,
    getOwnProfile,
} from "../mocks/db";

interface CreateProfileOptions {
    username?: string;
    fullName?: string;
}

export function createProfile({
    username,
    fullName,
}: CreateProfileOptions): Profile {
    const user = db.user.create({ username });
    return db.profile.create({ user, full_name: fullName }) as Profile;
}

export function createProfiles(
    quantity: number,
    options: CreateProfileOptions
): Profile[] {
    const profiles: Profile[] = [];

    for (let i = 0; i < quantity; i++) {
        const profile = createProfile(options);
        profiles.push(profile);
    }

    return profiles;
}

interface CreateVideoOptions {
    profile?: Profile;
    uploadDate?: Date;
    title?: string;
    description?: string;
    viewCount?: number;
    likeCount?: number;
    isLiked?: boolean;
    commentCount?: number;
    isSaved?: boolean;
}

export function createVideo({
    profile,
    uploadDate,
    title,
    description,
    viewCount,
    likeCount,
    isLiked,
    commentCount,
    isSaved,
}: CreateVideoOptions): Video {
    if (!profile) profile = createProfile({});

    return db.video.create({
        profile,
        upload_date: uploadDate,
        title,
        description,
        view_count: viewCount,
        like_count: likeCount,
        is_liked: isLiked,
        comment_count: commentCount,
        is_saved: isSaved,
    }) as Video;
}

export function createVideos(
    quantity: number,
    options: CreateVideoOptions
): Video[] {
    const videos: Video[] = [];

    for (let i = 0; i < quantity; i++) {
        const video = createVideo(options);
        videos.push(video);
    }

    return videos;
}

export function isVideoLiked(videoId: number): boolean {
    const ownProfile = getOwnProfile();
    return (
        db.like.count({
            where: {
                video: { id: { equals: videoId } },
                profile: { id: { equals: ownProfile.id } },
            },
        }) > 0
    );
}

export function isVideoSaved(videoId: number): boolean {
    const ownProfile = getOwnProfile();
    return (
        db.savedVideo.count({
            where: {
                video: { id: { equals: videoId } },
                profile: { equals: ownProfile.id },
            },
        }) > 0
    );
}

export function countEvents(videoId: number, type: EventType) {
    return db.event.count({
        where: {
            video: { id: { equals: videoId } },
            type: { equals: type },
        },
    });
}

export function countReports(videoId: number, reason: ReportReason) {
    return db.report.count({
        where: {
            video: { id: { equals: videoId } },
            reason: { equals: reason },
        },
    });
}

interface CreateCommentOptions {
    isReply?: boolean;
    video?: Video;
    profile?: Profile;
    parent?: Comment;
    mentionedProfile?: Profile;
    text?: string;
    creationDate?: Date;
    replyCount?: number;
    popularityScore?: number;
}

export function createComment({
    isReply,
    video,
    profile,
    parent,
    mentionedProfile,
    text,
    creationDate,
    replyCount,
    popularityScore,
}: CreateCommentOptions): Comment {
    const videoId = parent
        ? parent.video
        : video
        ? video.id
        : db.video.create({ profile: createProfile({}) }).id;

    if (!profile) profile = createProfile({});
    if (isReply && !parent) parent = createComment({ video });

    return db.comment.create({
        video: videoId,
        profile,
        parent: parent?.id,
        mentioned_profile: mentionedProfile ? mentionedProfile.id : null,
        mentioned_profile_username: mentionedProfile
            ? mentionedProfile.user.username
            : null,
        text,
        creation_date: creationDate,
        reply_count: replyCount,
        popularity_score: popularityScore,
    }) as Comment;
}

export function createComments(
    quantity: number,
    options: CreateCommentOptions
): Comment[] {
    const comments: Comment[] = [];

    for (let i = 0; i < quantity; i++) {
        const comment = createComment(options);
        comments.push(comment);
    }

    return comments;
}

export function sortComments(
    comments: Comment[],
    ordering: "popularity" | "newest_first" | "oldest_first"
) {
    switch (ordering) {
        case "popularity": {
            comments.sort((a, b) => b.popularity_score - a.popularity_score);
            return;
        }
        case "oldest_first": {
            comments.sort(
                (a, b) => a.creation_date.getTime() - b.creation_date.getTime()
            );
            return;
        }
        case "newest_first": {
            comments.sort(
                (a, b) => b.creation_date.getTime() - a.creation_date.getTime()
            );
            return;
        }
    }
}

export function isCommentLiked(commentId: number): boolean {
    const ownProfile = getOwnProfile();
    return (
        db.commentLike.count({
            where: {
                comment: { equals: commentId },
                profile: { equals: ownProfile.id },
            },
        }) > 0
    );
}

interface CountCommentsOptions {
    videoId?: number;
    parentId?: number;
    mentionedProfile?: Profile;
    text?: string;
}

export function countComments({
    videoId,
    parentId,
    mentionedProfile,
    text,
}: CountCommentsOptions): number {
    return db.comment.count({
        where: {
            video: videoId ? { equals: videoId } : undefined,
            parent: parentId ? { equals: parentId } : undefined,
            mentioned_profile: mentionedProfile
                ? { equals: mentionedProfile.id }
                : undefined,
            mentioned_profile_username: mentionedProfile
                ? { equals: mentionedProfile.user.username }
                : undefined,
            text: text ? { equals: text } : undefined,
        },
    });
}

export function countCommentReports(
    commentId: number,
    reason: CommentReportReason
) {
    return db.commentReport.count({
        where: {
            comment: { id: { equals: commentId } },
            reason: { equals: reason },
        },
    });
}

export function countViews(videoId: number) {
    return db.view.count({
        where: {
            video: { id: { equals: videoId } },
        },
    });
}
