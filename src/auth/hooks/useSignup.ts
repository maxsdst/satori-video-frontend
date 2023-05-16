import { useMutation } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { AxiosError } from "axios";

interface SignupData {
    email: string;
    full_name: string;
    username: string;
    password: string;
}

interface SignupResponse {
    email: string;
    username: string;
    id: number;
}

interface ErrorData {
    email?: string[];
    full_name?: string[];
    username?: string[];
    password?: string[];
}

interface UseSignupOptions {
    onSignup: (data: SignupResponse) => void;
    onError: (data: ErrorData) => void;
}

function useSignup({ onSignup, onError }: UseSignupOptions) {
    return useMutation<SignupResponse, AxiosError<ErrorData>, SignupData>({
        mutationFn: (data) =>
            apiClient.post("/auth/users/", data).then((res) => res.data),
        onSuccess: (data) => onSignup(data),
        onError: (error) => {
            if (error.response?.data) onError(error.response.data);
        },
    });
}

export default useSignup;
