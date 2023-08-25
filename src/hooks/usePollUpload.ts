import { useQuery } from "@tanstack/react-query";
import Upload from "../entities/Upload";
import ApiClient from "../services/ApiClient";

const POLLING_INTERVAL_MS = 2000;

const apiClient = new ApiClient<Upload>("/videos/uploads/");

function usePollUpload(uploadId: number) {
    const { data: upload, error } = useQuery<Upload, Error>({
        queryKey: ["uploads", uploadId],
        queryFn: () => apiClient.get(uploadId),
        refetchInterval: (upload) =>
            upload?.is_done ? false : POLLING_INTERVAL_MS,
    });

    return {
        isDone: upload?.is_done || false,
        video: upload?.video || null,
        error,
    };
}

export default usePollUpload;
