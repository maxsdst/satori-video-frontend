import { QueryFilters, QueryKey, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface UseOptimisticUpdateOptions<T> {
    queryFilters: QueryFilters;
    updater: (data: T | undefined) => T | undefined;
    shouldInvalidateQueries?: boolean;
}

function useOptimisticUpdate<T>({
    queryFilters,
    updater,
    shouldInvalidateQueries,
}: UseOptimisticUpdateOptions<T>) {
    const queryClient = useQueryClient();
    const [previousData, setPreviousData] = useState<
        [QueryKey, T | undefined][] | null
    >(null);

    async function onMutate() {
        await queryClient.cancelQueries(queryFilters);
        const data = queryClient.getQueriesData<T>(queryFilters);
        queryClient.setQueriesData<T>(queryFilters, updater);
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
