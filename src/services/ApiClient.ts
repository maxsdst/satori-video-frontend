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

function appendId(endpoint: string, id?: number | string) {
    return typeof id === "undefined" ? endpoint : endpoint + id + "/";
}

export interface GetAllResponse<T> {
    count: number;
    previous: string | null;
    next: string | null;
    results: T[];
}

class ApiClient<T> {
    endpoint: string;

    constructor(endpoint: string) {
        if (!endpoint.endsWith("/")) endpoint += "/";
        this.endpoint = endpoint;
    }

    getAll = (requestConfig?: AxiosRequestConfig) => {
        return axiosInstance
            .get<GetAllResponse<T>>(this.endpoint, requestConfig)
            .then((res) => res.data);
    };

    get = (id?: number | string, requestConfig?: AxiosRequestConfig) => {
        const url = appendId(this.endpoint, id);
        return axiosInstance.get<T>(url, requestConfig).then((res) => res.data);
    };

    post = (data: any, requestConfig?: AxiosRequestConfig) => {
        return axiosInstance
            .post<T>(this.endpoint, data, requestConfig)
            .then((res) => res.data);
    };

    patch = (
        id: number | string | undefined,
        data: any,
        requestConfig?: AxiosRequestConfig
    ) => {
        const url = appendId(this.endpoint, id);
        return axiosInstance
            .patch<T>(url, data, requestConfig)
            .then((res) => res.data);
    };

    delete = (id?: number | string, requestConfig?: AxiosRequestConfig) => {
        const url = appendId(this.endpoint, id);
        return axiosInstance
            .delete<T>(url, requestConfig)
            .then((res) => res.data);
    };
}

export default ApiClient;
