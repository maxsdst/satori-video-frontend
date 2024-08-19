import { Spinner, Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffectOnce } from "react-use";
import Video from "../../entities/Video";
import useGroupedByDate from "../../hooks/history/useGroupedByDate";
import { formatRelativeDateWithoutTime } from "../../utils";
import VideoGrid from "../VideoGrid";
import ActionMenuList from "./ActionMenuList";

function History() {
    const {
        data,
        isLoading,
        isSuccess,
        error,
        fetchNextPage,
        hasNextPage,
        remove,
        refetch,
    } = useGroupedByDate({ pagination: { type: "cursor", pageSize: 10 } }, {});

    useEffectOnce(() => {
        if (data) {
            remove();
            void refetch();
        }
    });

    const { history, entryCount } = useMemo<{
        history: [string, Video[]][];
        entryCount: number;
    }>(() => {
        if (!data) return { history: [], entryCount: 0 };

        const history = new Map<string, Video[]>();
        let entryCount = 0;

        for (const page of data.pages)
            for (const { date, entries } of page.results) {
                const videos = entries.map((entry) => entry.video);

                if (history.has(date))
                    history.set(date, [...history.get(date)!, ...videos]);
                else history.set(date, videos);

                entryCount += entries.length;
            }

        return { history: Array.from(history.entries()), entryCount };
    }, [data]);

    if (error) throw error;

    return (
        <VStack alignItems="start" width="100%" spacing={12}>
            <Text fontSize="3xl" fontWeight="semibold">
                Watch history
            </Text>
            {isSuccess && entryCount === 0 && (
                <Text>Your watch history is empty.</Text>
            )}
            <InfiniteScroll
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={null}
                dataLength={entryCount}
                scrollThreshold="50px"
                style={{ overflowX: "hidden" }}
            >
                <VStack alignItems="start" width="100%" spacing={12}>
                    {history.map(([date, videos], index) => (
                        <VStack
                            data-testid="history-section"
                            key={index}
                            alignItems="start"
                            width="100%"
                            spacing={4}
                        >
                            <Text
                                aria-label="Date"
                                fontSize="2xl"
                                fontWeight="semibold"
                            >
                                {formatRelativeDateWithoutTime(
                                    new Date(date),
                                    new Date()
                                )}
                            </Text>
                            <VideoGrid
                                videos={videos}
                                showUsers={true}
                                showLikes={false}
                                actionMenuList={ActionMenuList}
                            />
                        </VStack>
                    ))}
                </VStack>
                {(hasNextPage || isLoading) && <Spinner marginTop={4} />}
            </InfiniteScroll>
        </VStack>
    );
}

export default History;
