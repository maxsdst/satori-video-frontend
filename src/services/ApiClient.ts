import axios, { AxiosRequestConfig } from "axios";
import {
    IAuthTokens,
    TokenRefreshRequest,
    applyAuthTokenInterceptor,
    getBrowserLocalStorage,
} from "axios-jwt";
import BaseQuery, { Filter, Ordering, Pagination } from "./BaseQuery";

const BASE_URL =
    (import.meta.env.VITE_API_URL as string) || "http://localhost:8000/api";

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
    pagination: Pagination,
    requestConfig: AxiosRequestConfig
) {
    switch (pagination.type) {
        case "limit_offset":
            requestConfig.params = {
                ...requestConfig.params,
                limit: pagination.limit,
                offset: pagination.offset,
            };
            break;

        case "cursor":
            requestConfig.params = {
                ...requestConfig.params,
                page_size: pagination.pageSize,
                cursor: pagination.cursor,
            };
            break;

        default:
            throw "Unknown pagination type";
    }
}

function parseDates<T>(object: any, dateFields: DateFields<T>) {
    if (typeof object !== "object" || object === null) return;

    for (const field of dateFields.own)
        if (object.hasOwnProperty(field))
            object[field] = new Date(object[field]);

    if (!dateFields.nested) return;

    for (const field of Object.keys(dateFields.nested) as Array<
        keyof DateFields<T>["nested"]
    >)
        parseDates(object[field], dateFields.nested[field]);
}

export enum PaginationType {
    LimitOffset,
    Cursor,
}

export interface PaginatedResponse<T> {
    previous: string | null;
    next: string | null;
    results: T[];
}

interface LimitOffsetPaginationResponse<T> extends PaginatedResponse<T> {
    count: number;
}
interface CursorPaginationResponse<T> extends PaginatedResponse<T> {}

export type GetAllResponse<T, PaginationT> =
    PaginationT extends PaginationType.Cursor
        ? CursorPaginationResponse<T>
        : LimitOffsetPaginationResponse<T>;

export interface DateFields<T> {
    own: T extends null ? never : (keyof T)[];
    nested?: T extends null
        ? never
        : {
              [K in keyof T]?: DateFields<T[K]>;
          };
}

class ApiClient<
    T,
    PaginationT extends PaginationType = PaginationType.LimitOffset
> {
    endpoint: string;
    dateFields?: DateFields<T>;

    constructor(endpoint: string, dateFields?: DateFields<T>) {
        if (!endpoint.endsWith("/")) endpoint += "/";
        this.endpoint = endpoint;
        this.dateFields = dateFields;
    }

    getAll = (
        requestConfig?: AxiosRequestConfig,
        query?: BaseQuery,
        fullUrl?: string
    ) => {
        if (!requestConfig) requestConfig = {} as AxiosRequestConfig;

        if (!fullUrl && query) {
            const { filters, ordering, pagination } = query;
            if (filters) applyFilters(filters, requestConfig);
            if (ordering) applyOrdering(ordering, requestConfig);
            if (pagination) applyPagination(pagination, requestConfig);
        }

        const url = fullUrl || this.endpoint;

        return axiosInstance
            .get<GetAllResponse<T, PaginationT>>(url, requestConfig)
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
