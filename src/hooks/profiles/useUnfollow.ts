import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { produce } from "immer";
import Profile from "../../entities/Profile";
import { PROFILES_CACHE_KEY, unfollow } from "../../services/profileService";
import useOptimisticUpdate from "../useOptimisticUpdate";

interface ErrorData {
    detail: string;
}

interface UseUnfollowOptions {
    shouldUpdateProfileOptimistically?: boolean;
}

function useUnfollow(
    username: string,
    { shouldUpdateProfileOptimistically }: UseUnfollowOptions
) {
    const optimisticUpdate = useOptimisticUpdate<Profile>({
        queryFilters: { queryKey: [PROFILES_CACHE_KEY, username], exact: true },
        updater: (profile) =>
            profile &&
            produce(profile, (draft) => {
                if (draft.is_following) draft.follower_count -= 1;
                draft.is_following = false;
            }),
        shouldInvalidateQueries: true,
    });

    return useMutation<null, AxiosError<ErrorData>, null>({
        mutationFn: () => unfollow(username),
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

export default useUnfollow;
