/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    InitialValues,
    ModelAPI,
    ModelDictionary,
} from "@mswjs/data/lib/glossary";
import { QuerySelectorWhere } from "@mswjs/data/lib/query/queryTypes";
import { HttpStatusCode } from "axios";
import { DefaultBodyType, HttpResponse, StrictRequest, http } from "msw";
import { replaceQueryParam } from "../../utils";

export default class HandlerGenerator<
    Dictionary extends ModelDictionary,
    ModelName extends string
> {
    model: ModelAPI<Dictionary, ModelName>;
    endpoint: string;

    constructor(model: ModelAPI<Dictionary, ModelName>, endpoint: string) {
        this.model = model;
        this.endpoint = endpoint;
    }

    create<TData>(
        handleData: (data: TData) => InitialValues<Dictionary, ModelName>
    ) {
        return http.post(this.endpoint, async ({ request }) => {
            const data = (await request.json()) as TData;
            const definition = handleData(data);

            const createdEntity = this.model.create(definition);

            return HttpResponse.json(createdEntity, { status: 201 });
        });
    }

    retrieve() {
        return http.get(`${this.endpoint}/:id`, ({ params }) => {
            const id = Number(params["id"]);

            const entity = this.model.findFirst({
                where: { id: { equals: id } } as any,
            });

            if (!entity)
                return new HttpResponse(null, {
                    status: HttpStatusCode.NotFound,
                });

            return HttpResponse.json(entity);
        });
    }

    update<TData>(
        handleData: (data: TData) => InitialValues<Dictionary, ModelName>
    ) {
        return http.patch(
            `${this.endpoint}/:id`,
            async ({ request, params }) => {
                const id = Number(params["id"]);
                const data = (await request.json()) as TData;
                const definition = handleData(data);

                const updatedEntity = this.model.update({
                    strict: true,
                    where: { id: { equals: id } } as any,
                    data: definition,
                });

                return HttpResponse.json(updatedEntity);
            }
        );
    }

    destroy() {
        return http.delete(`${this.endpoint}/:id`, ({ params }) => {
            const id = Number(params["id"]);

            this.model.delete({
                strict: true,
                where: { id: { equals: id } } as any,
            });

            return HttpResponse.json(null, { status: 204 });
        });
    }

    list(
        paginationType: PaginationType,
        getFilters?: (queryParams: URLSearchParams) => QuerySelectorWhere<any>
    ) {
        return http.get(this.endpoint, ({ request }) => {
            const searchParams = new URL(request.url).searchParams;
            const where = getFilters?.(searchParams);

            const results = this.model.findMany({
                where,
                orderBy: getOrdering(searchParams) as any,
            });

            const response = paginateResults(request, paginationType, results);
            return HttpResponse.json(response);
        });
    }
}

interface Ordering {
    [field: string]: "asc" | "desc";
}

function getOrdering(queryParams: URLSearchParams): Ordering | undefined {
    const ordering = queryParams.get("ordering");
    if (!ordering) return undefined;

    const direction = ordering[0] === "-" ? "desc" : "asc";
    const field = ordering.replace(/^-/, "");

    return { [field]: direction };
}

type PaginationType = "limit_offset" | "cursor";

export interface PaginatedResponse<T> {
    previous: string | null;
    next: string | null;
    results: T[];
}

interface LimitOffsetPaginationResponse<T> extends PaginatedResponse<T> {
    count: number;
}
interface CursorPaginationResponse<T> extends PaginatedResponse<T> {}

export function paginateResults(
    request: StrictRequest<DefaultBodyType>,
    paginationType: PaginationType,
    results: any[]
): LimitOffsetPaginationResponse<any> | CursorPaginationResponse<any> {
    switch (paginationType) {
        case "limit_offset":
            return paginateResultsLimitOffset(request, results);

        case "cursor": {
            return paginateResultsCursor(request, results);
        }
    }
}

function paginateResultsLimitOffset(
    request: StrictRequest<DefaultBodyType>,
    results: any[]
): LimitOffsetPaginationResponse<any> {
    const searchParams = new URL(request.url).searchParams;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : Infinity;
    const offsetParam = searchParams.get("offset");
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    const paginatedResults = results.slice(offset, offset + limit);

    let nextOffset = null;
    if (limitParam && results.length > offset + limit)
        nextOffset = offset + limit;

    const nextPage = nextOffset
        ? replaceQueryParam(request.url, "offset", nextOffset.toString())
        : null;

    return {
        previous: request.url,
        next: nextPage,
        results: paginatedResults,
        count: results.length,
    };
}

function paginateResultsCursor(
    request: StrictRequest<DefaultBodyType>,
    results: any[]
): CursorPaginationResponse<any> {
    const searchParams = new URL(request.url).searchParams;
    const pageSizeParam = searchParams.get("page_size");
    const pageSize = pageSizeParam ? parseInt(pageSizeParam) : Infinity;
    const cursorParam = searchParams.get("cursor");
    const cursor = cursorParam ? parseInt(cursorParam) : 0;

    const limit = pageSize;
    const offset = cursor;

    const paginatedResults = results.slice(offset, offset + limit);

    let nextOffset = null;
    if (pageSizeParam && results.length > offset + pageSize)
        nextOffset = offset + pageSize;

    const nextPage = nextOffset
        ? replaceQueryParam(request.url, "cursor", nextOffset.toString())
        : null;

    return {
        previous: request.url,
        next: nextPage,
        results: paginatedResults,
    };
}
