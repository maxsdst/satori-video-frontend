import Pagination from "@choc-ui/paginator";
import { useEffect, useReducer } from "react";
import paginationReducer from "./paginationReducer";

interface Props {
    defaultPageSize: 10 | 30 | 50;
    totalItems: number;
    onChange: (limit: number, offset: number) => void;
}

function LimitOffsetPagination({
    defaultPageSize,
    totalItems,
    onChange,
}: Props) {
    const pageSizeOptions = [10, 30, 50];

    const [pagination, dispatch] = useReducer(paginationReducer, {
        currentPage: 1,
        limit: defaultPageSize,
        offset: 0,
        totalItems,
    });

    useEffect(() => {
        dispatch({
            type: "SET_TOTAL_ITEMS",
            totalItems,
        });
    }, [totalItems]);

    useEffect(() => {
        onChange(pagination.limit, pagination.offset);
    }, [pagination.limit, pagination.offset]);

    return (
        <Pagination
            defaultCurrent={1}
            current={pagination.currentPage}
            pageSizeOptions={pageSizeOptions}
            defaultPageSize={defaultPageSize}
            pageSize={pagination.limit}
            showSizeChanger={true}
            total={pagination.totalItems}
            onChange={(currentPage) =>
                dispatch({
                    type: "SET_CURRENT_PAGE",
                    page: currentPage ?? 1,
                })
            }
            onShowSizeChange={(currentPage, size) =>
                dispatch({
                    type: "SET_PAGE_SIZE",
                    page: currentPage ?? 1,
                    pageSize: size ?? defaultPageSize,
                })
            }
            colorScheme="blue"
            baseStyles={{ backgroundColor: "gray.700" }}
            paginationProps={{
                display: "flex",
            }}
            responsive={{ activePage: true, pageSize: true }}
        />
    );
}

export default LimitOffsetPagination;
