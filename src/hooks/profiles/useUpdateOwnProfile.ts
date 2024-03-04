import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Profile from "../../entities/Profile";
import { updateOwnProfile } from "../../services/profileService";

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

function useUpdateOwnProfile({ onError }: UseUpdateOwnProfileOptions) {
    return useMutation<Profile, AxiosError<ErrorData>, ProfileData>({
        mutationFn: (data) => updateOwnProfile(data),
        onError: (error) => {
            if (error.response?.data) onError(error.response.data);
        },
    });
}

export default useUpdateOwnProfile;
