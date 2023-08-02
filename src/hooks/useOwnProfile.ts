import { useQuery } from "@tanstack/react-query";
import { AxiosError, HttpStatusCode } from "axios";
import useLogout from "../auth/hooks/useLogout";
import Profile from "../entities/Profile";
import ApiClient from "../services/ApiClient";

const apiClient = new ApiClient<Profile>("/profiles/profiles/me/");

function useOwnProfile() {
    const logout = useLogout();

    return useQuery<Profile | null, AxiosError>({
        queryKey: ["own-profile"],
        queryFn: () =>
            apiClient.get().catch((error) => {
                if (error instanceof AxiosError && error.response) {
                    const status = error.response.status as HttpStatusCode;
                    if (status === HttpStatusCode.Unauthorized) {
                        logout();
                        return null;
                    }
                }
                throw error;
            }),
    });
}

export default useOwnProfile;
