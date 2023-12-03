import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { removeLike } from "../services/likeService";

interface ErrorData {
    detail: string;
}

function useRemoveLike(videoId: number) {
    return useMutation<null, AxiosError<ErrorData>, null>({
        mutationFn: () => removeLike(videoId),
    });
}

export default useRemoveLike;
