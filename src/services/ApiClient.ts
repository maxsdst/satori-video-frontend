import axios, { AxiosRequestConfig } from "axios";
import {
    IAuthTokens,
    TokenRefreshRequest,
    applyAuthTokenInterceptor,
    getBrowserLocalStorage,
} from "axios-jwt";
import BaseQuery, { Filter, Ordering, Pagination } from "./BaseQuery";

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

function applyFilters(filters: Filter[], requestConfig: AxiosRequestConfig) {
    const params: Record<string, string> = {};

    for (const filter of filters) {
        const name =
            filter.lookupType === "exact"
                ? filter.field
                : filter.field + "__" + filter.lookupType;
        params[name] = filter.value.toString();
    }

    requestConfig.params = { ...requestConfig.params, ...params };
}

function applyOrdering(
    { field, direction }: Ordering,
    requestConfig: AxiosRequestConfig
) {
    const ordering = (direction === "DESC" ? "-" : "") + field;
    requestConfig.params = { ...requestConfig.params, ordering };
}

function applyPagination(
    { limit, offset }: Pagination,
    requestConfig: AxiosRequestConfig
) {
    requestConfig.params = { ...requestConfig.params, limit, offset };
}

function parseDates(object: any, dateFields: string[]) {
    if (typeof object !== "object" || object === null) return;
    for (const field of dateFields)
        if (object.hasOwnProperty(field))
            object[field] = new Date(object[field]);
}

export interface GetAllResponse<T> {
    count: number;
    previous: string | null;
    next: string | null;
    results: T[];
}

class ApiClient<T> {
    endpoint: string;
    dateFields?: string[];

    constructor(endpoint: string, dateFields?: string[]) {
        if (!endpoint.endsWith("/")) endpoint += "/";
        this.endpoint = endpoint;
        this.dateFields = dateFields;
    }

    getAll = (requestConfig?: AxiosRequestConfig, query?: BaseQuery) => {
        if (!requestConfig) requestConfig = {} as AxiosRequestConfig;

        if (query) {
            const { filters, ordering, pagination } = query;
            if (filters) applyFilters(filters, requestConfig);
            if (ordering) applyOrdering(ordering, requestConfig);
            if (pagination) applyPagination(pagination, requestConfig);
        }

        return axiosInstance
            .get<GetAllResponse<T>>(this.endpoint, requestConfig)
            .then((res) => {
                if (this.dateFields)
                    for (const object of res.data.results)
                        parseDates(object, this.dateFields);

                return res.data;
            });
    };

    get = (id?: number | string, requestConfig?: AxiosRequestConfig) => {
        const url = appendId(this.endpoint, id);
        return axiosInstance.get<T>(url, requestConfig).then((res) => {
            if (this.dateFields) parseDates(res.data, this.dateFields);
            return res.data;
        });
    };

    post = (data: any, requestConfig?: AxiosRequestConfig) => {
        return axiosInstance
            .post<T>(this.endpoint, data, requestConfig)
            .then((res) => {
                if (this.dateFields) parseDates(res.data, this.dateFields);
                return res.data;
            });
    };

    patch = (
        id: number | string | undefined,
        data: any,
        requestConfig?: AxiosRequestConfig
    ) => {
        const url = appendId(this.endpoint, id);
        return axiosInstance.patch<T>(url, data, requestConfig).then((res) => {
            if (this.dateFields) parseDates(res.data, this.dateFields);
            return res.data;
        });
    };

    delete = (id?: number | string, requestConfig?: AxiosRequestConfig) => {
        const url = appendId(this.endpoint, id);
        return axiosInstance.delete<T>(url, requestConfig).then((res) => {
            if (this.dateFields) parseDates(res.data, this.dateFields);
            return res.data;
        });
    };
}

export default ApiClient;
