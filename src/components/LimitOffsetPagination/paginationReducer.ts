interface PaginationState {
    currentPage: number;
    limit: number;
    offset: number;
    totalItems: number;
}

interface SetCurrentPageAction {
    type: "SET_CURRENT_PAGE";
    page: number;
}

interface SetPageSize {
    type: "SET_PAGE_SIZE";
    pageSize: number;
    page: number;
}

interface SetTotalItems {
    type: "SET_TOTAL_ITEMS";
    totalItems: number;
}

type Action = SetCurrentPageAction | SetPageSize | SetTotalItems;

function paginationReducer(
    state: PaginationState,
    action: Action
): PaginationState {
    switch (action.type) {
        case "SET_CURRENT_PAGE":
            return {
                ...state,
                currentPage: action.page,
                offset: (action.page - 1) * state.limit,
            };

        case "SET_PAGE_SIZE":
            const offset = (action.page - 1) * action.pageSize;
            return {
                ...state,
                currentPage: offset < state.totalItems ? action.page : 1,
                limit: action.pageSize,
                offset: offset < state.totalItems ? offset : 0,
            };

        case "SET_TOTAL_ITEMS":
            return {
                ...state,
                totalItems: action.totalItems,
            };
    }

    return state;
}

export default paginationReducer;
