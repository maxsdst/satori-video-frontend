import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { removeLike } from "../services/commentLikeService";

interface ErrorData {
    detail: string;
}

function useRemoveCommentLike(commentId: number) {
    return useMutation<null, AxiosError<ErrorData>, null>({
        mutationFn: () => removeLike(commentId),
    });
}

export default useRemoveCommentLike;
