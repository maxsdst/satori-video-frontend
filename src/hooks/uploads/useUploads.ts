import { useQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import uploadService, {
    GetAllResponse,
    UPLOADS_CACHE_KEY,
} from "../../services/uploadService";

export interface UploadQuery extends BaseQuery {}

interface UseUploadsOptions {
    staleTime?: number;
    keepPreviousData?: boolean;
}

function useUploads(
    query: UploadQuery,
    { staleTime, keepPreviousData }: UseUploadsOptions
) {
    return useQuery<GetAllResponse, Error>({
        queryKey: [UPLOADS_CACHE_KEY, query],
        staleTime,
        queryFn: () => uploadService.getAll({}, query),
        keepPreviousData,
    });
}

export default useUploads;
