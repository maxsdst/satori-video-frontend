import axios, { AxiosRequestConfig } from "axios";
import {
    IAuthTokens,
    TokenRefreshRequest,
    applyAuthTokenInterceptor,
    getBrowserLocalStorage,
} from "axios-jwt";

const BASE_URL = "http://localhost:8000/api";

const axiosInstance = axios.create({ baseURL: BASE_URL });

const requestRefresh: TokenRefreshRequest = async (
    refreshToken: string
): Promise<IAuthTokens | string> => {
    const response = await axios.post(`${BASE_URL}/auth/jwt/refresh/`, {
        refresh: refreshToken,
    });

    return response.data.access;
};

applyAuthTokenInterceptor(axiosInstance, {
    requestRefresh,
    getStorage: getBrowserLocalStorage,
    headerPrefix: "JWT ",
});

class ApiClient<T> {
    endpoint: string;

    constructor(endpoint: string) {
        if (!endpoint.endsWith("/")) endpoint += "/";
        this.endpoint = endpoint;
    }

    get = (id?: number | string, requestConfig?: AxiosRequestConfig) => {
        const url =
            typeof id === "undefined"
                ? this.endpoint
                : this.endpoint + id + "/";

        return axiosInstance.get<T>(url, requestConfig).then((res) => res.data);
    };

    post = (data: any, requestConfig?: AxiosRequestConfig) => {
        return axiosInstance
            .post<T>(this.endpoint, data, requestConfig)
            .then((res) => res.data);
    };
}

export default ApiClient;
