import {
    InfiniteData,
    useInfiniteQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import Comment from "../entities/Comment";
import BaseQuery from "../services/BaseQuery";
import commentService, { GetAllResponse } from "../services/commentService";

export interface CommentQuery extends BaseQuery {
    videoId?: number;
    parentId?: number;
}

function getQueryKey(query: CommentQuery) {
    return ["comments", query];
}

interface UseCommentsOptions {
    staleTime?: number;
    enabled?: boolean;
}

function useComments(
    query: CommentQuery,
    { staleTime, enabled }: UseCommentsOptions
) {
    return useInfiniteQuery<GetAllResponse, Error>({
        queryKey: getQueryKey(query),
        staleTime,
        enabled,
        queryFn: ({ pageParam }) => {
            if (pageParam) return commentService.getAll({}, {}, pageParam);
            return commentService.getAll(
                {
                    params: {
                        video: query.videoId,
                        parent: query.parentId,
                    },
                },
                query
            );
        },
        getNextPageParam: (lastPage) => lastPage.next || undefined,
    });
}

export default useComments;

export function useHandleCommentUpdated(query: CommentQuery) {
    const queryClient = useQueryClient();

    return (updatedComment: Comment) => {
        queryClient.setQueryData(
            getQueryKey(query),
            (data: InfiniteData<GetAllResponse> | undefined) => {
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

    return useCallback(
        (deletedCommentId: number) => {
            queryClient.setQueryData(
                getQueryKey(query),
                (data: InfiniteData<GetAllResponse> | undefined) => {
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
        },
        [query, queryClient]
    );
}
