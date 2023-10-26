import { Filter } from "../../../services/BaseQuery";

export interface Option {
    field: string;
    name: string;
    type: "char" | "number";
}

interface FilteringState {
    options: Option[];
    availableOptions: Option[];
    appliedFilters: Filter[];
}

interface AddFilterAction {
    type: "ADD_FILTER";
    filter: Filter;
}

interface RemoveFilterAction {
    type: "REMOVE_FILTER";
    filter: Filter;
}

type Action = AddFilterAction | RemoveFilterAction;

function isFilterApplied(state: FilteringState, filter: Filter): boolean {
    return !!state.appliedFilters.find((x) => x.field === filter.field);
}

function addFilter(state: FilteringState, filter: Filter): FilteringState {
    return {
        ...state,
        appliedFilters: [...state.appliedFilters, filter],
    };
}

function removeFilter(state: FilteringState, filter: Filter): FilteringState {
    return {
        ...state,
        appliedFilters: state.appliedFilters.filter((x) => x !== filter),
    };
}

function refreshAvailableOptions(state: FilteringState): FilteringState {
    return {
        ...state,
        availableOptions: state.options.filter(
            (option) =>
                !state.appliedFilters.find(
                    (filter) => filter.field === option.field
                )
        ),
    };
}

function filteringReducer(
    state: FilteringState,
    action: Action
): FilteringState {
    switch (action.type) {
        case "ADD_FILTER":
            if (isFilterApplied(state, action.filter)) return state;
            state = addFilter(state, action.filter);
            break;

        case "REMOVE_FILTER":
            state = removeFilter(state, action.filter);
            break;
    }

    return refreshAvailableOptions(state);
}

export default filteringReducer;
