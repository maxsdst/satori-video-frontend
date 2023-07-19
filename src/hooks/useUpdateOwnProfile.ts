import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Profile from "../entities/Profile";
import ApiClient from "../services/ApiClient";

interface ProfileData {
    full_name?: string;
    description?: string;
    avatar?: File;
}

interface ErrorData {
    full_name?: string[];
    description?: string[];
    avatar?: string[];
}

interface UseUpdateOwnProfileOptions {
    onError: (data: ErrorData) => void;
}

const apiClient = new ApiClient<Profile>("/profiles/profiles/me/");

function useUpdateOwnProfile({ onError }: UseUpdateOwnProfileOptions) {
    return useMutation<Profile, AxiosError<ErrorData>, ProfileData>({
        mutationFn: (data) =>
            apiClient.patch(undefined, data, {
                headers: { "Content-Type": "multipart/form-data" },
            }),
        onError: (error) => {
            if (error.response?.data) onError(error.response.data);
        },
    });
}

export default useUpdateOwnProfile;
