import { AbsoluteCenter, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import VideoSequence from "../../components/VideoSequence";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../../constants";
import Video from "../../entities/Video";
import useSavedVideos from "../../hooks/saved_videos/useSavedVideos";
import useFollowingVideos from "../../hooks/videos/useFollowingVideos";
import useLatestVideos from "../../hooks/videos/useLatestVideos";
import usePopularVideos from "../../hooks/videos/usePopularVideos";
import useRecommendedVideos from "../../hooks/videos/useRecommendedVideos";
import useVideo from "../../hooks/videos/useVideo";
import useVideoSearch from "../../hooks/videos/useVideoSearch";
import BaseQuery from "../../services/BaseQuery";
import { MAIN_CONTENT_AREA_PADDING } from "../../styleConstants";
import { getAllResultsFromInfiniteQueryData } from "../../utils";
import VideoPageContext from "./VideoPageContext";

interface ObjectWithVideoField {
    video: Video;
}

export enum VideoSource {
    Recommended = "recommended",
    Popular = "popular",
    Latest = "latest",
    Search = "search",
    SavedVideos = "saved_videos",
    Following = "following",
}

export interface LocationState {
    videoSource?: VideoSource;
    query?: BaseQuery;
    initialVideoIndex?: number;
    highlightedCommentId?: number;
    highlightedCommentParentId?: number;
}

interface Props {
    videoSource?: VideoSource;
}

function VideoPage({ videoSource: videoSourceProp }: Props) {
    const location = useLocation();
    const {
        videoSource: videoSourceLocation,
        query: queryLocation,
        initialVideoIndex: initialVideoIndexLocation,
        highlightedCommentId: highlightedCommentIdLocation,
        highlightedCommentParentId: highlightedCommentParentIdLocation,
    } = useMemo<LocationState>(() => {
        if (!location.state) return {};
        const {
            videoSource,
            query,
            initialVideoIndex,
            highlightedCommentId,
            highlightedCommentParentId,
        } = location.state;
        return {
            videoSource: Object.values(VideoSource).includes(videoSource)
                ? videoSource
                : undefined,
            query: query as BaseQuery,
            initialVideoIndex:
                typeof initialVideoIndex === "number"
                    ? initialVideoIndex
                    : undefined,
            highlightedCommentId:
                typeof highlightedCommentId === "number"
                    ? highlightedCommentId
                    : undefined,
            highlightedCommentParentId:
                typeof highlightedCommentParentId === "number"
                    ? highlightedCommentParentId
                    : undefined,
        };
    }, [location.state]);

    const navigate = useNavigate();

    useEffect(() => {
        navigate(location.pathname, { replace: true, state: null });
    }, [location.state]);

    const [videoSource, setVideoSource] = useState<VideoSource>(
        videoSourceLocation || videoSourceProp || VideoSource.Recommended
    );
    const [query, setQuery] = useState(queryLocation);
    const [initialVideoIndex, setInitialVideoIndex] = useState(
        videoSourceLocation && queryLocation ? initialVideoIndexLocation : 0
    );
    const [highlightedCommentId, setHighlightedCommentId] = useState(
        highlightedCommentIdLocation
    );
    const [highlightedCommentParentId, setHighlightedCommentParentId] =
        useState(highlightedCommentParentIdLocation);

    const { videoId } = useParams();
    const [initialVideoId, setInitialVideoId] = useState(videoId);

    const [isVideoQueryEnabled, setVideoQueryEnabled] = useState(
        videoSourceLocation
            ? typeof initialVideoIndexLocation !== "number"
            : !!videoId
    );

    const {
        data: video,
        isLoading,
        error,
        remove,
    } = useVideo(parseInt(initialVideoId!), {
        enabled: isVideoQueryEnabled,
        staleTime: Infinity,
    });

    const recommendedVideos = useRecommendedVideos(
        query || {
            pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
        },
        {
            enabled: videoSource === VideoSource.Recommended,
            staleTime: Infinity,
        }
    );

    const popularVideos = usePopularVideos(
        query || {
            pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
        },
        { enabled: videoSource === VideoSource.Popular, staleTime: Infinity }
    );

    const latestVideos = useLatestVideos(
        query || {
            pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
        },
        { enabled: videoSource === VideoSource.Latest, staleTime: Infinity }
    );

    const videoSearch = useVideoSearch(
        query || {
            pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
        },
        { enabled: videoSource === VideoSource.Search, staleTime: Infinity }
    );

    const savedVideos = useSavedVideos(
        query || {
            pagination: {
                type: "limit_offset",
                limit: VIDEO_SEQUENCE_PAGE_SIZE,
            },
        },
        {
            enabled: videoSource === VideoSource.SavedVideos,
            staleTime: Infinity,
        }
    );

    const followingVideos = useFollowingVideos(
        query || {
            pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
        },
        { enabled: videoSource === VideoSource.Following, staleTime: Infinity }
    );

    const videosQuery = (() => {
        switch (videoSource) {
            case VideoSource.Recommended:
                return recommendedVideos;
            case VideoSource.Popular:
                return popularVideos;
            case VideoSource.Latest:
                return latestVideos;
            case VideoSource.Search:
                return videoSearch;
            case VideoSource.SavedVideos:
                return savedVideos;
            case VideoSource.Following:
                return followingVideos;
            default:
                return null;
        }
    })();

    function reset() {
        remove();
        [
            recommendedVideos,
            popularVideos,
            latestVideos,
            videoSearch,
            savedVideos,
            followingVideos,
        ].forEach((x) => {
            if (x === videosQuery && query) return;
            x.remove();
        });
        setInitialVideoId(videoId);
        setVideoSource(
            videoSourceLocation || videoSourceProp || VideoSource.Recommended
        );
        setQuery(queryLocation);
        setInitialVideoIndex(initialVideoIndexLocation);
        setHighlightedCommentId(highlightedCommentIdLocation);
        setHighlightedCommentParentId(highlightedCommentParentIdLocation);
        setVideoQueryEnabled(
            videoSourceLocation
                ? typeof initialVideoIndexLocation !== "number"
                : !!videoId
        );
    }

    useLayoutEffect(() => {
        if (videoSourceLocation || videoSourceProp) reset();
    }, [videoSourceProp, videoSourceLocation]);

    const allVideos = useMemo<Video[]>(() => {
        const videos = [];
        if (isVideoQueryEnabled && video) videos.push(video);
        if (videosQuery?.data)
            videos.push(
                ...getAllResultsFromInfiniteQueryData<
                    Video | ObjectWithVideoField
                >(videosQuery.data).map((item) =>
                    "video" in item ? item.video : item
                )
            );

        return videos;
    }, [video, videosQuery?.data]);

    const showSpinner =
        (isVideoQueryEnabled && isLoading) ||
        (!isVideoQueryEnabled && videosQuery?.isLoading);

    if (error) throw error;
    if (videosQuery?.error) throw videosQuery.error;

    return (
        <VideoPageContext.Provider
            value={{
                fetchedVideos: allVideos,
            }}
        >
            <Flex
                width="100%"
                height="100%"
                justifyContent="center"
                alignItems="start"
                paddingX={MAIN_CONTENT_AREA_PADDING}
                paddingTop={MAIN_CONTENT_AREA_PADDING}
            >
                {showSpinner ? (
                    <AbsoluteCenter>
                        <Spinner />
                    </AbsoluteCenter>
                ) : (
                    <VideoSequence
                        videos={allVideos}
                        onFetchMore={() => videosQuery?.fetchNextPage()}
                        initialVideoIndex={initialVideoIndex}
                        highlightedCommentId={highlightedCommentId}
                        highlightedCommentParentId={highlightedCommentParentId}
                    />
                )}
            </Flex>
        </VideoPageContext.Provider>
    );
}

export default VideoPage;
