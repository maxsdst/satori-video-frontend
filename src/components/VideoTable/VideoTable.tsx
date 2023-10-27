import { Spinner } from "@chakra-ui/react";
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
import { convertDateToString } from "../../utils";
import Table, { ColumnDef, FilteringOption } from "../Table";
import VideoCell from "./VideoCell";
import "./VideoTable.css";

export interface VideoTableHandle {
    refetchVideos: () => void;
}

const VideoTable = forwardRef(({}, ref: Ref<VideoTableHandle>) => {
    const defaultPageSize = 10;

    const [videoQuery, setVideoQuery] = useState<VideoQuery>({
        pagination: { limit: defaultPageSize, offset: 0 },
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

    if (isOwnProfileLoading || areVideosLoading) return <Spinner />;
    if (ownProfileError) throw ownProfileError;
    if (videosError) throw videosError;

    const columnDefs: ColumnDef<Video>[] = [
        {
            field: "title",
            header: "Video",
            cell: (video) => (
                <VideoCell
                    video={video}
                    onVideoMutated={() => refetchVideos()}
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
            field: "views",
            name: "Views",
            type: "number",
        },
    ];

    return (
        <Table
            columnDefs={columnDefs}
            filteringOptions={filteringOptions}
            mainFilteringField="title"
            onFilteringChange={(filters) =>
                setVideoQuery({ ...videoQuery, filters })
            }
            defaultOrdering={{ field: "upload_date", direction: "DESC" }}
            onOrderingChange={(ordering) =>
                setVideoQuery({ ...videoQuery, ordering })
            }
            defaultPageSize={defaultPageSize}
            onPaginationChange={(pagination) =>
                setVideoQuery({ ...videoQuery, pagination })
            }
            data={videos.results}
            totalItems={videos.count}
        />
    );
});

export default VideoTable;
