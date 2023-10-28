import { useQuery } from "@tanstack/react-query";
import Upload from "../entities/Upload";
import { GetAllResponse } from "../services/ApiClient";
import BaseQuery from "../services/BaseQuery";
import uploadService from "../services/uploadService";

export interface UploadQuery extends BaseQuery {}

interface UseUploadsOptions {
    staleTime?: number;
    keepPreviousData?: boolean;
}

function useUploads(
    query: UploadQuery,
    { staleTime, keepPreviousData }: UseUploadsOptions
) {
    return useQuery<GetAllResponse<Upload>, Error>({
        queryKey: ["uploads", query],
        staleTime,
        queryFn: () => uploadService.getAll({}, query),
        keepPreviousData,
    });
}

export default useUploads;
