import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface UseOptimisticUpdateOptions<T> {
    queryKey: QueryKey;
    updater: (data: T) => T;
}

function useOptimisticUpdate<T>({
    queryKey,
    updater,
}: UseOptimisticUpdateOptions<T>) {
    const queryClient = useQueryClient();
    const [previous, setPrevious] = useState<T | null>(null);

    async function onMutate() {
        await queryClient.cancelQueries({ queryKey });
        const data = queryClient.getQueryData<T>(queryKey);
        if (data) queryClient.setQueryData<T>(queryKey, updater(data));
        setPrevious(data || null);
    }

    function onError() {
        if (previous) queryClient.setQueryData(queryKey, previous);
    }

    function onSettled() {
        setPrevious(null);
        queryClient.invalidateQueries({ queryKey });
    }

    return { onMutate, onError, onSettled };
}

export default useOptimisticUpdate;
