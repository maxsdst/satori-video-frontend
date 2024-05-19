import { QueryFilters, QueryKey, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface UseOptimisticUpdateOptions<TData, TVariables> {
    queryFilters: QueryFilters;
    updater: (
        data: TData | undefined,
        variables?: TVariables
    ) => TData | undefined;
    shouldInvalidateQueries?: boolean;
}

function useOptimisticUpdate<TData, TVariables = void>({
    queryFilters,
    updater,
    shouldInvalidateQueries,
}: UseOptimisticUpdateOptions<TData, TVariables>) {
    const queryClient = useQueryClient();
    const [previousData, setPreviousData] = useState<
        [QueryKey, TData | undefined][] | null
    >(null);

    async function onMutate(variables?: TVariables) {
        await queryClient.cancelQueries(queryFilters);
        const data = queryClient.getQueriesData<TData>(queryFilters);
        queryClient.setQueriesData<TData>(queryFilters, (data) =>
            updater(data, variables)
        );
        setPreviousData(data);
    }

    function onError() {
        if (previousData) {
            for (const [queryKey, data] of previousData) {
                queryClient.setQueryData(queryKey, data);
            }
        }
    }

    function onSettled() {
        setPreviousData(null);
        if (shouldInvalidateQueries)
            queryClient.invalidateQueries(queryFilters);
    }

    return { onMutate, onError, onSettled };
}

export default useOptimisticUpdate;
