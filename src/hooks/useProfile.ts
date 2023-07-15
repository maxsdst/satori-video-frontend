import { useQuery } from "@tanstack/react-query";
import Profile from "../entities/Profile";
import ApiClient from "../services/ApiClient";

const apiClient = new ApiClient<Profile>(
    "/profiles/profiles/retrieve_by_username/"
);

function useProfile(username: string) {
    return useQuery<Profile, Error>({
        queryKey: ["profiles", username],
        queryFn: () => apiClient.get(username),
    });
}

export default useProfile;
