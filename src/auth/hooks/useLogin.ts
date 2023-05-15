import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { setAuthTokens } from "axios-jwt";
import apiClient from "../../services/apiClient";

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

function useLogin(onLogin: () => void) {
    return useMutation<JwtTokenPair, AxiosError<ErrorData>, LoginData>({
        mutationFn: (data) =>
            apiClient
                .post<JwtTokenPair>("/auth/jwt/create", data)
                .then((res) => res.data),
        onSuccess: (data) => {
            setAuthTokens({
                refreshToken: data.refresh,
                accessToken: data.access,
            });
            onLogin();
        },
    });
}

export default useLogin;
