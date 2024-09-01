import { useQuery } from "@tanstack/react-query";
import Upload from "../../entities/Upload";
import uploadService, { UPLOADS_CACHE_KEY } from "../../services/uploadService";

const POLLING_INTERVAL_MS = 1000;

function usePollUpload(uploadId: number) {
    const { data: upload, error } = useQuery<Upload, Error>({
        queryKey: [UPLOADS_CACHE_KEY, uploadId],
        queryFn: () => uploadService.get(uploadId),
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
