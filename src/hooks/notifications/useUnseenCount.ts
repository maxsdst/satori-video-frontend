import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import {
    UNSEEN_COUNT_CACHE_KEY,
    unseenCount,
} from "../../services/notificationService";

function useUnseenCount() {
    return useQuery<number, Error>({
        queryKey: [UNSEEN_COUNT_CACHE_KEY],
        queryFn: unseenCount,
        refetchInterval: ms("1m"),
    });
}

export default useUnseenCount;
