import {
    Spinner,
    Table,
    TableContainer,
    Tbody,
    Th,
    Thead,
    Tr,
    VStack,
} from "@chakra-ui/react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import ms from "ms";
import {
    Ref,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import Video from "../../entities/Video";
import useOwnProfile from "../../hooks/useOwnProfile";
import useVideos, { VideoQuery } from "../../hooks/useVideos";
import { MAIN_CONTENT_AREA_PADDING } from "../../styleConstants";
import LimitOffsetPagination from "../LimitOffsetPagination";
import Cell from "./Cell";
import VideoCell from "./VideoCell";
import "./VideoTable.css";
import { NUMERIC_COLUMNS } from "./constants";

export interface VideoTableHandle {
    refetchVideos: () => void;
}

const VideoTable = forwardRef(({}, ref: Ref<VideoTableHandle>) => {
    const defaultPageSize = 10;

    const [videoQuery, setVideoQuery] = useState<VideoQuery>({
        limit: defaultPageSize,
        offset: 0,
    });

    const {
        data: ownProfile,
        isLoading: isOwnProfileLoading,
        error: ownProfileError,
    } = useOwnProfile();

    useEffect(() => {
        if (ownProfile)
            setVideoQuery({ ...videoQuery, profileId: ownProfile.id });
    }, [ownProfile]);

    const {
        data: videos,
        isLoading: areVideosLoading,
        error: videosError,
        refetch: refetchVideos,
    } = useVideos(videoQuery, {
        staleTime: ms("5m"),
        enabled: !!videoQuery.profileId,
        keepPreviousData: true,
    });

    useImperativeHandle(ref, () => ({ refetchVideos }));

    const columnHelper = createColumnHelper<Video>();

    const table = useReactTable<Video>({
        data: videos?.results || [],
        getCoreRowModel: getCoreRowModel(),
        columns: [
            {
                accessorKey: "title",
                header: "Video",
                cell: ({ row: { original: video } }) => (
                    <VideoCell
                        video={video}
                        onVideoMutated={() => refetchVideos()}
                    />
                ),
            },
            columnHelper.display({
                id: "upload_date",
                header: "Upload date",
                cell: "Aug 23, 2023",
            }),
            columnHelper.display({
                id: "view_count",
                header: "Views",
                cell: "0",
            }),
            columnHelper.display({
                id: "like_count",
                header: "Likes",
                cell: "0",
            }),
            columnHelper.display({
                id: "comment_count",
                header: "Comments",
                cell: "0",
            }),
        ],
    });

    const [highlightedRowId, setHighlightedRowId] = useState<string | null>(
        null
    );

    if (isOwnProfileLoading || areVideosLoading) return <Spinner />;
    if (ownProfileError) throw ownProfileError;
    if (videosError) throw videosError;

    return (
        <VStack
            width="100%"
            maxWidth={`calc(100vw - ${MAIN_CONTENT_AREA_PADDING} * 2)`}
            spacing={4}
        >
            <TableContainer width="100%" overflowX="auto">
                <Table variant="simple" size="sm">
                    <Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Th
                                        key={header.id}
                                        isNumeric={NUMERIC_COLUMNS.includes(
                                            header.column.id
                                        )}
                                        paddingY={2}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </Thead>
                    <Tbody fontSize="xs">
                        {table.getRowModel().rows.map((row) => (
                            <Tr
                                key={row.id}
                                onClick={() => setHighlightedRowId(row.id)}
                                onMouseOver={() => setHighlightedRowId(row.id)}
                                className={classNames({
                                    "is-highlighted":
                                        row.id === highlightedRowId,
                                })}
                            >
                                {row.getVisibleCells().map((cell: any) => (
                                    <Cell key={cell.id} cell={cell} />
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
            <LimitOffsetPagination
                defaultPageSize={defaultPageSize}
                totalItems={videos.count}
                onChange={(limit, offset) =>
                    setVideoQuery({
                        ...videoQuery,
                        limit,
                        offset,
                    })
                }
            />
        </VStack>
    );
});

export default VideoTable;
