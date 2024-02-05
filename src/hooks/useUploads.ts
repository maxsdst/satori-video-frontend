import { useQuery } from "@tanstack/react-query";
import BaseQuery from "../services/BaseQuery";
import uploadService, { GetAllResponse } from "../services/uploadService";

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
        queryKey: ["uploads", query],
        staleTime,
        queryFn: () => uploadService.getAll({}, query),
        keepPreviousData,
    });
}

export default useUploads;
