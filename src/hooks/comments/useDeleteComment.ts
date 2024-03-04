import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Comment from "../../entities/Comment";
import commentService from "../../services/commentService";

interface ErrorData {
    detail: string;
}

function useDeleteComment(commentId: number) {
    return useMutation<Comment, AxiosError<ErrorData>, null>({
        mutationFn: () => commentService.delete(commentId),
    });
}

export default useDeleteComment;
