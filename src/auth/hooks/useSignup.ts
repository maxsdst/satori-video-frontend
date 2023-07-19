import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import ApiClient from "../../services/ApiClient";

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
    onError: (data: ErrorData) => void;
}

const apiClient = new ApiClient<SignupResponse>("/auth/users/");

function useSignup({ onError }: UseSignupOptions) {
    return useMutation<SignupResponse, AxiosError<ErrorData>, SignupData>({
        mutationFn: apiClient.post,
        onError: (error) => {
            if (error.response?.data) onError(error.response.data);
        },
    });
}

export default useSignup;
