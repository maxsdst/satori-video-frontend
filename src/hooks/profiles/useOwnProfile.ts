import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useLogout from "../../auth/hooks/useLogout";
import Profile from "../../entities/Profile";
import {
    OWN_PROFILE_CACHE_KEY,
    getOwnProfile,
} from "../../services/profileService";

function useOwnProfile() {
    const logout = useLogout();

    return useQuery<Profile | null, AxiosError>({
        queryKey: [OWN_PROFILE_CACHE_KEY],
        queryFn: async () => {
            const profile = await getOwnProfile();
            if (!profile) logout();
            return profile;
        },
    });
}

export default useOwnProfile;
