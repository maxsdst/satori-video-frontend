import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { setAuthTokens } from "axios-jwt";
import ApiClient from "../../services/ApiClient";

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
    return useMutation<JwtTokenPair, AxiosError<ErrorData>, LoginData>({
        mutationFn: apiClient.post,
        onSuccess: (data) => {
            setAuthTokens({
                refreshToken: data.refresh,
                accessToken: data.access,
            });
        },
    });
}

export default useLogin;
