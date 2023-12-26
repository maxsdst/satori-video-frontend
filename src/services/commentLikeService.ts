import CommentLike from "../entities/CommentLike";
import ApiClient from "./ApiClient";

export default new ApiClient<CommentLike>("/videos/comment_likes/");

export function removeLike(commentId: number) {
    const apiClient = new ApiClient<null>("/videos/comment_likes/remove_like/");
    return apiClient.post({ comment: commentId });
}
