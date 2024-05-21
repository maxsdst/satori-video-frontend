import { useInfiniteQuery } from "@tanstack/react-query";
import BaseQuery from "../../services/BaseQuery";
import likeService, {
    GetAllResponse,
    LIKES_CACHE_KEY,
} from "../../services/likeService";

export interface LikesQuery extends BaseQuery {
    videoId?: number;
    profileId?: number;
}

interface UseLikesOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useLikes(query: LikesQuery, { staleTime, enabled }: UseLikesOptions) {
    return useInfiniteQuery<GetAllResponse, Error>({
        queryKey: [LIKES_CACHE_KEY, query],
        staleTime,
        enabled,
        queryFn: ({ pageParam }) => {
            if (pageParam) return likeService.getAll({}, {}, pageParam);
            return likeService.getAll(
                {
                    params: {
                        video: query.videoId,
                        profile: query.profileId,
                    },
                },
                query
            );
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useLikes;
