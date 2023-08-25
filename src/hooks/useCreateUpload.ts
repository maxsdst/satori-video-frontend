import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Upload from "../entities/Upload";
import ApiClient from "../services/ApiClient";

interface UploadData {
    file: File;
}

interface ErrorData {
    file?: string[];
}

interface UseCreateUploadOptions {
    onError: (data: ErrorData) => void;
    onUploadProgress?: (percentCompleted: number) => void;
}

const apiClient = new ApiClient<Upload>("/videos/uploads/");

function useCreateUpload({
    onError,
    onUploadProgress,
}: UseCreateUploadOptions) {
    return useMutation<Upload, AxiosError<ErrorData>, UploadData>({
        mutationFn: (data) =>
            apiClient.post(data, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (e) =>
                    e.total &&
                    onUploadProgress?.(Math.round((e.loaded * 100) / e.total)),
            }),
        onError: (error) => {
            if (error.response?.data) onError(error.response.data);
        },
    });
}

export default useCreateUpload;
