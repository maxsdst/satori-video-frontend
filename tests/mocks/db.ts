/* eslint-disable @typescript-eslint/unbound-method */
import { faker } from "@faker-js/faker";
import { factory, nullable, oneOf, primaryKey } from "@mswjs/data";
import Profile from "../../src/entities/Profile";
import User from "../../src/entities/User";

export type ReportReason =
    | "sex"
    | "violence"
    | "hate"
    | "harassment"
    | "danger"
    | "misinformation"
    | "child_abuse"
    | "terrorism"
    | "spam";

export type CommentReportReason =
    | "spam"
    | "pornography"
    | "child_abuse"
    | "hate_speech"
    | "terrorism"
    | "harassment"
    | "suicide"
    | "misinformation";

export type EventType = "view" | "like" | "share" | "save";

export type NotificationType = "profile" | "video" | "comment";
export type NotificationSubtype =
    | "new_follower"
    | "upload_processed"
    | "comment"
    | "followed_profile_video"
    | "like"
    | "reply";

export const db = factory({
    user: {
        id: primaryKey(faker.number.int),
        username: faker.internet.userName,
    },
    profile: {
        id: primaryKey(faker.number.int),
        user: oneOf("user", { unique: true }),
        full_name: faker.internet.displayName,
        description: faker.lorem.sentence,
        avatar: nullable(() => randomUrl() + ".jpg"),
        following_count: () => faker.number.int({ min: 1, max: 100 }),
        follower_count: () => faker.number.int({ min: 1, max: 100 }),
        is_following: Boolean,
    },
    video: {
        id: primaryKey(faker.number.int),
        profile: oneOf("profile"),
        upload_date: faker.date.past,
        title: faker.lorem.sentence,
        description: faker.lorem.paragraph,
        source: () => randomUrl() + ".mp4",
        thumbnail: () => randomUrl() + ".jpg",
        first_frame: () => randomUrl() + ".jpg",
        view_count: () => faker.number.int({ min: 1, max: 100 }),
        like_count: () => faker.number.int({ min: 1, max: 100 }),
        is_liked: Boolean,
        comment_count: () => faker.number.int({ min: 1, max: 100 }),
        is_saved: Boolean,
    },
    upload: {
        id: primaryKey(faker.number.int),
        profile: faker.number.int,
        creation_date: faker.date.past,
        filename: faker.system.commonFileName,
        video: oneOf("video", { nullable: true }),
        is_done: Boolean,
    },
    view: {
        id: primaryKey(faker.number.int),
        video: oneOf("video"),
        profile: oneOf("profile"),
    },
    historyEntry: {
        id: primaryKey(faker.number.int),
        video: oneOf("video"),
        profile: faker.number.int,
        creation_date: faker.date.past,
    },
    like: {
        id: primaryKey(faker.number.int),
        video: oneOf("video"),
        profile: oneOf("profile"),
        creation_date: faker.date.past,
    },
    report: {
        id: primaryKey(faker.number.int),
        video: oneOf("video"),
        profile: oneOf("profile"),
        reason: () =>
            faker.helpers.arrayElement<ReportReason>([
                "sex",
                "violence",
                "hate",
                "harassment",
                "danger",
                "misinformation",
                "child_abuse",
                "terrorism",
                "spam",
            ]),
    },
    comment: {
        id: primaryKey(faker.number.int),
        video: faker.number.int,
        profile: oneOf("profile"),
        mentioned_profile: nullable((): number | null => null),
        mentioned_profile_username: nullable((): string | null => null),
        parent: nullable((): number | null => null),
        text: faker.lorem.sentence,
        creation_date: faker.date.past,
        reply_count: () => faker.number.int({ min: 1, max: 100 }),
        like_count: () => faker.number.int({ min: 1, max: 100 }),
        is_liked: Boolean,
    },
    commentLike: {
        id: primaryKey(faker.number.int),
        comment: faker.number.int,
        profile: faker.number.int,
    },
    commentReport: {
        id: primaryKey(faker.number.int),
        comment: oneOf("comment"),
        profile: oneOf("profile"),
        reason: () =>
            faker.helpers.arrayElement<CommentReportReason>([
                "spam",
                "pornography",
                "child_abuse",
                "hate_speech",
                "terrorism",
                "harassment",
                "suicide",
                "misinformation",
            ]),
    },
    savedVideo: {
        id: primaryKey(faker.number.int),
        video: oneOf("video"),
        profile: faker.number.int,
        creation_date: faker.date.past,
    },
    event: {
        id: primaryKey(faker.number.int),
        video: oneOf("video"),
        type: () =>
            faker.helpers.arrayElement<EventType>([
                "view",
                "like",
                "share",
                "save",
            ]),
    },
    notification: {
        id: primaryKey(faker.number.int),
        profile: faker.number.int,
        creation_date: faker.date.past,
        is_seen: Boolean,
        type: () =>
            faker.helpers.arrayElement<NotificationType>([
                "profile",
                "video",
                "comment",
            ]),
        subtype: () =>
            faker.helpers.arrayElement<NotificationSubtype>([
                "new_follower",
                "upload_processed",
                "comment",
                "followed_profile_video",
                "like",
                "reply",
            ]),
        related_profile: oneOf("profile", { nullable: true }),
        video: oneOf("video", { nullable: true }),
        comment: oneOf("comment", { nullable: true }),
        reply: oneOf("reply", { nullable: true }),
    },
});

export const CORRECT_PASSWORD = "test1234";
export const INCORRECT_PASSWORD = "1234test";

let ownProfile: Profile | undefined = undefined;
let ownProfileUser: User | undefined = undefined;

export function getOwnProfile(): Profile {
    if (!ownProfile) {
        ownProfileUser = db.user.create();
        ownProfile = db.profile.create({
            user: ownProfileUser,
            is_following: false,
        }) as Profile;
    }

    return ownProfile;
}

export function deleteOwnProfile() {
    if (ownProfile)
        db.profile.delete({ where: { id: { equals: ownProfile.id } } });
    if (ownProfileUser)
        db.user.delete({ where: { id: { equals: ownProfileUser.id } } });
    ownProfile = undefined;
    ownProfileUser = undefined;
}

function randomUrl() {
    return faker.internet.url({ appendSlash: true }) + faker.string.alpha(10);
}
