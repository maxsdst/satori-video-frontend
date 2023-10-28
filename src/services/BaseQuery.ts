interface BaseFilter {
    field: string;
}

interface CharFilter extends BaseFilter {
    type: "char";
    lookupType: "icontains";
    value: string;
}

interface NumberFilter extends BaseFilter {
    type: "number";
    lookupType: "lte" | "gte";
    value: number;
}

interface BooleanFilter extends BaseFilter {
    type: "boolean";
    lookupType: "exact";
    value: boolean;
}

export type Filter = CharFilter | NumberFilter | BooleanFilter;

export interface Ordering {
    field: string;
    direction?: "ASC" | "DESC";
}

export interface Pagination {
    limit?: number;
    offset?: number;
}

export default interface BaseQuery {
    filters?: Filter[];
    ordering?: Ordering;
    pagination?: Pagination;
}
