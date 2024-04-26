import { AxiosError, HttpStatusCode } from "axios";
import Profile from "../entities/Profile";
import ApiClient, {
    GetAllResponse as GenericGetAllResponse,
    PaginationType,
} from "./ApiClient";
import BaseQuery from "./BaseQuery";

export const PROFILES_CACHE_KEY = "profiles";
export const OWN_PROFILE_CACHE_KEY = "own_profile";
export const PROFILE_SEARCH_CACHE_KEY = "profile_search";
export const FOLLOWING_CACHE_KEY = "following";
export const FOLLOWERS_CACHE_KEY = "followers";

export default new ApiClient<Profile, PaginationType.Cursor>(
    "/profiles/profiles/"
);

export type GetAllResponse = GenericGetAllResponse<
    Profile,
    PaginationType.Cursor
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

export function search(
    searchQuery: string,
    query?: BaseQuery,
    fullUrl?: string
) {
    const apiClient = new ApiClient<Profile, PaginationType.Cursor>(
        "/profiles/profiles/search/"
    );
    return apiClient.getAll({ params: { query: searchQuery } }, query, fullUrl);
}

export function follow(username: string) {
    const apiClient = new ApiClient<null>(
        `/profiles/profiles/follow/${username}/`
    );
    return apiClient.post(undefined);
}

export function unfollow(username: string) {
    const apiClient = new ApiClient<null>(
        `/profiles/profiles/unfollow/${username}/`
    );
    return apiClient.post(undefined);
}

export function following(
    username: string,
    query?: BaseQuery,
    fullUrl?: string
) {
    const apiClient = new ApiClient<Profile, PaginationType.Cursor>(
        `/profiles/profiles/following/${username}/`
    );
    return apiClient.getAll({}, query, fullUrl);
}

export function followers(
    username: string,
    query?: BaseQuery,
    fullUrl?: string
) {
    const apiClient = new ApiClient<Profile, PaginationType.Cursor>(
        `/profiles/profiles/followers/${username}/`
    );
    return apiClient.getAll({}, query, fullUrl);
}
