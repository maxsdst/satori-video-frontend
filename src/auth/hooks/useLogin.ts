import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { setAuthTokens } from "axios-jwt";
import ApiClient from "../../services/ApiClient";
import { OWN_PROFILE_CACHE_KEY } from "../../services/profileService";

interface LoginData {
    username: string;
    password: string;
}

interface JwtTokenPair {
    refresh: string;
    access: string;
}

interface ErrorData {
    detail: string;
}

const apiClient = new ApiClient<JwtTokenPair>("/auth/jwt/create");

function useLogin() {
    const queryClient = useQueryClient();

    return useMutation<JwtTokenPair, AxiosError<ErrorData>, LoginData>({
        mutationFn: apiClient.post,
        onMutate: () => {
            void queryClient.invalidateQueries([OWN_PROFILE_CACHE_KEY]);
        },
        onSuccess: (data) => {
            setAuthTokens({
                refreshToken: data.refresh,
                accessToken: data.access,
            });
        },
    });
}

export default useLogin;
