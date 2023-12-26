import {
    InfiniteData,
    useInfiniteQuery,
    useQueryClient,
} from "@tanstack/react-query";
import Comment from "../entities/Comment";
import { GetAllResponse } from "../services/ApiClient";
import BaseQuery from "../services/BaseQuery";
import commentService from "../services/commentService";

export interface CommentQuery extends BaseQuery {
    videoId?: number;
    parentId?: number;
}

function getQueryKey(query: CommentQuery) {
    return ["comments", query];
}

interface UseCommentsOptions {
    pageSize: number;
    staleTime?: number;
    enabled?: boolean;
}

function useComments(
    query: CommentQuery,
    { pageSize, staleTime, enabled }: UseCommentsOptions
) {
    return useInfiniteQuery<GetAllResponse<Comment>, Error>({
        queryKey: getQueryKey(query),
        staleTime,
        enabled,
        queryFn: ({ pageParam = 1 }) =>
            commentService.getAll(
                {
                    params: {
                        video: query.videoId,
                        parent: query.parentId,
                    },
                },
                {
                    ...query,
                    pagination: {
                        limit: pageSize,
                        offset: (pageParam - 1) * pageSize,
                    },
                }
            ),
        getNextPageParam: (lastPage, allPages) =>
            lastPage.next ? allPages.length + 1 : undefined,
    });
}

export default useComments;

export function useHandleCommentUpdated(query: CommentQuery) {
    const queryClient = useQueryClient();

    return (updatedComment: Comment) => {
        queryClient.setQueryData(
            getQueryKey(query),
            (data: InfiniteData<GetAllResponse<Comment>> | undefined) => {
                if (!data) return data;

                return {
                    ...data,
                    pages: data.pages.map((page) => ({
                        ...page,
                        results: page.results.map((item) =>
                            item.id === updatedComment.id
                                ? updatedComment
                                : item
                        ),
                    })),
                };
            }
        );
    };
}

export function useHandleCommentDeleted(query: CommentQuery) {
    const queryClient = useQueryClient();

    return (deletedCommentId: number) => {
        queryClient.setQueryData(
            getQueryKey(query),
            (data: InfiniteData<GetAllResponse<Comment>> | undefined) => {
                if (!data) return data;

                return {
                    ...data,
                    pages: data.pages.map((page) => ({
                        ...page,
                        results: page.results.filter(
                            (item) => item.id !== deletedCommentId
                        ),
                    })),
                };
            }
        );
    };
}
