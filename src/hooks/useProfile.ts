import { useQuery } from "@tanstack/react-query";
import Profile from "../entities/Profile";
import {
    PROFILES_CACHE_KEY,
    retrieveByUsername,
} from "../services/profileService";

function useProfile(username: string) {
    return useQuery<Profile, Error>({
        queryKey: [PROFILES_CACHE_KEY, username],
        queryFn: () => retrieveByUsername(username),
    });
}

export default useProfile;
