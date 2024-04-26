import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Profile from "../../entities/Profile";
import { PROFILES_CACHE_KEY, follow } from "../../services/profileService";
import useOptimisticUpdate from "../useOptimisticUpdate";

interface ErrorData {
    detail: string;
}

interface UseFollowOptions {
    shouldUpdateProfileOptimistically?: boolean;
}

function useFollow(
    username: string,
    { shouldUpdateProfileOptimistically }: UseFollowOptions
) {
    const optimisticUpdate = useOptimisticUpdate<Profile>({
        queryFilters: { queryKey: [PROFILES_CACHE_KEY, username], exact: true },
        updater: (profile) =>
            profile &&
            produce(profile, (draft) => {
                if (!draft.is_following) draft.follower_count += 1;
                draft.is_following = true;
            }),
        shouldInvalidateQueries: true,
    });

    return useMutation<null, AxiosError<ErrorData>, null>({
        mutationFn: () => follow(username),
        onMutate: async () => {
            if (shouldUpdateProfileOptimistically)
                await optimisticUpdate.onMutate();
        },
        onError: () => {
            if (shouldUpdateProfileOptimistically) optimisticUpdate.onError();
        },
        onSettled: () => {
            if (shouldUpdateProfileOptimistically) optimisticUpdate.onSettled();
        },
    });
}

export default useFollow;
