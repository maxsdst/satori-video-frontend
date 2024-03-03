import { AxiosError, HttpStatusCode } from "axios";
import Profile from "../entities/Profile";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";

export const PROFILES_CACHE_KEY = "profiles";
export const OWN_PROFILE_CACHE_KEY = "own_profile";

export default new ApiClient<Profile, PaginationType.LimitOffset>(
    "/profiles/profiles/"
);

export type GetAllResponse = GenericGetAllResponse<
    Profile,
    PaginationType.LimitOffset
>;

const ownProfileApiClient = new ApiClient<Profile>("/profiles/profiles/me/");

export function getOwnProfile() {
    return ownProfileApiClient.get().catch((error) => {
        if (error instanceof AxiosError && error.response) {
            const status = error.response.status as HttpStatusCode;
            if (status === HttpStatusCode.Unauthorized) return null;
        }
        throw error;
    });
}

export function updateOwnProfile(data: any) {
    return ownProfileApiClient.patch(undefined, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export function retrieveByUsername(username: string) {
    const apiClient = new ApiClient<Profile>(
        "/profiles/profiles/retrieve_by_username/"
    );
    return apiClient.get(username);
}
