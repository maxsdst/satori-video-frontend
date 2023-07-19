import { QueryClient } from "@tanstack/react-query";
import { AxiosError, HttpStatusCode } from "axios";

const NO_RETRY_STATUS_CODES = [
    HttpStatusCode.Unauthorized,
    HttpStatusCode.NotFound,
];

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error instanceof AxiosError && error.response) {
                    const status = error.response.status as HttpStatusCode;
                    if (NO_RETRY_STATUS_CODES.includes(status)) return false;
                }

                if (failureCount >= 3) return false;
                return true;
            },
        },
    },
});

export default queryClient;
