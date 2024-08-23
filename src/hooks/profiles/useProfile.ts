import { useQuery } from "@tanstack/react-query";
import Profile from "../../entities/Profile";
import {
    PROFILES_CACHE_KEY,
    retrieveByUsername,
} from "../../services/profileService";

interface UseProfileOptions {
    enabled?: boolean;
}

function useProfile(username: string, { enabled }: UseProfileOptions = {}) {
    return useQuery<Profile, Error>({
        queryKey: [PROFILES_CACHE_KEY, username],
        queryFn: () => retrieveByUsername(username),
        enabled,
    });
}

export default useProfile;
