import { Spinner } from "@chakra-ui/react";
import numbro from "numbro";
import {
    Ref,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import Video from "../../entities/Video";
import useOwnProfile from "../../hooks/profiles/useOwnProfile";
import useVideos, { VideoQuery } from "../../hooks/videos/useVideos";
import { Ordering } from "../../services/BaseQuery";
import {
    convertDateToString,
    getAllResultsFromInfiniteQueryData,
} from "../../utils";
import Table, { ColumnDef, FilteringOption } from "../Table";
import VideoCell from "./VideoCell";
import "./VideoTable.css";

export interface VideoTableHandle {
    refetchVideos: () => void;
}

const VideoTable = forwardRef(({}, ref: Ref<VideoTableHandle>) => {
    const defaultPageSize = 10;

    const defaultOrdering: Ordering = {
        field: "upload_date",
        direction: "DESC",
    };

    const [videoQuery, setVideoQuery] = useState<VideoQuery>({
        ordering: defaultOrdering,
        pagination: { type: "limit_offset", limit: defaultPageSize, offset: 0 },
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
        data,
        isLoading: areVideosLoading,
        error: videosError,
        refetch: refetchVideos,
    } = useVideos(videoQuery, {
        enabled: !!videoQuery.profileId,
        keepPreviousData: true,
    });

    useImperativeHandle(ref, () => ({ refetchVideos }));

    if (isOwnProfileLoading || areVideosLoading)
        return <Spinner role="progressbar" />;
    if (ownProfileError) throw ownProfileError;
    if (videosError) throw videosError;

    const columnDefs: ColumnDef<Video>[] = [
        {
            field: "title",
            header: "Video",
            cell: (video) => (
                <VideoCell
                    video={video}
                    onVideoMutated={() => void refetchVideos()}
                />
            ),
            enableOrdering: true,
        },
        {
            field: "upload_date",
            header: "Upload date",
            cell: (video) => convertDateToString(video.upload_date),
            enableOrdering: true,
        },
        {
            field: "view_count",
            header: "Views",
            cell: (video) =>
                numbro(video.view_count).format({ thousandSeparated: true }),
            enableOrdering: true,
        },
        {
            field: "like_count",
            header: "Likes",
            cell: (video) =>
                numbro(video.like_count).format({ thousandSeparated: true }),
            enableOrdering: true,
        },
    ];

    const filteringOptions: FilteringOption[] = [
        {
            field: "title",
            name: "Title",
            type: "char",
        },
        {
            field: "description",
            name: "Description",
            type: "char",
        },
        {
            field: "view_count",
            name: "Views",
            type: "number",
        },
    ];

    const videos = getAllResultsFromInfiniteQueryData(data);
    const totalVideos = data.pages.length > 0 ? data.pages[0].count : 0;

    return (
        <Table
            dataTestId="video-table"
            columnDefs={columnDefs}
            filteringOptions={filteringOptions}
            mainFilteringField="title"
            onFilteringChange={(filters) =>
                setVideoQuery({ ...videoQuery, filters })
            }
            defaultOrdering={defaultOrdering}
            onOrderingChange={(ordering) =>
                setVideoQuery({ ...videoQuery, ordering })
            }
            defaultPageSize={defaultPageSize}
            onPaginationChange={(pagination) =>
                setVideoQuery({ ...videoQuery, pagination })
            }
            data={videos}
            totalItems={totalVideos}
        />
    );
});

export default VideoTable;
