import { useQuery } from "@tanstack/react-query";
import Profile from "../entities/Profile";
import ApiClient from "../services/ApiClient";

const apiClient = new ApiClient<Profile>("/profiles/profiles/me/");

function useOwnProfile() {
    return useQuery<Profile, Error>({
        queryKey: ["own-profile"],
        queryFn: () => apiClient.get(),
    });
}

export default useOwnProfile;
