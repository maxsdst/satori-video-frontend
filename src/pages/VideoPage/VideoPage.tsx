import { AbsoluteCenter, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useUpdateEffect } from "react-use";
import VideoSequence, {
    VideoSequenceHandle,
} from "../../components/VideoSequence";
import { VIDEO_SEQUENCE_PAGE_SIZE } from "../../constants";
import Video from "../../entities/Video";
import useLikes from "../../hooks/likes/useLikes";
import useSavedVideos from "../../hooks/saved_videos/useSavedVideos";
import useFollowingVideos from "../../hooks/videos/useFollowingVideos";
import useLatestVideos from "../../hooks/videos/useLatestVideos";
import usePopularVideos from "../../hooks/videos/usePopularVideos";
import useRecommendedVideos from "../../hooks/videos/useRecommendedVideos";
import useVideo from "../../hooks/videos/useVideo";
import useVideoSearch from "../../hooks/videos/useVideoSearch";
import useVideos from "../../hooks/videos/useVideos";
import BaseQuery from "../../services/BaseQuery";
import { MAIN_CONTENT_AREA_PADDING } from "../../styleConstants";
import { getAllResultsFromInfiniteQueryData } from "../../utils";
import VideoPageContext from "./VideoPageContext";

interface ObjectWithVideoField {
    video: Video;
}

export enum VideoSource {
    Videos = "videos",
    Recommended = "recommended",
    Popular = "popular",
    Latest = "latest",
    Search = "search",
    SavedVideos = "saved_videos",
    Following = "following",
    Likes = "likes",
}

export interface LocationState {
    videoSource?: VideoSource;
    query?: BaseQuery;
    initialVideoIndex?: number;
    highlightedCommentId?: number;
    highlightedCommentParentId?: number;
}

function VideoPage() {
    const location = useLocation();
    const locationState = useMemo<LocationState>(() => {
        return location.state ? (location.state as LocationState) : {};
    }, [location.state]);

    const navigate = useNavigate();

    useEffect(() => {
        navigate(location.pathname, { replace: true, state: null });
    }, [location.state]);

    const [videoSource, setVideoSource] = useState<VideoSource>(
        locationState.videoSource || VideoSource.Recommended
    );
    const [query, setQuery] = useState(locationState.query);
    const [initialVideoIndex, setInitialVideoIndex] = useState(
        locationState.videoSource && locationState.initialVideoIndex
            ? locationState.initialVideoIndex
            : 0
    );
    const [highlightedCommentId, setHighlightedCommentId] = useState(
        locationState.highlightedCommentId
    );
    const [highlightedCommentParentId, setHighlightedCommentParentId] =
        useState(locationState.highlightedCommentParentId);

    const { videoId } = useParams();
    const [initialVideoId, setInitialVideoId] = useState(videoId);

    const [isVideoQueryEnabled, setVideoQueryEnabled] = useState(
        !locationState.videoSource
    );

    const {
        data: video,
        isLoading,
        error,
        remove,
        refetch,
    } = useVideo(parseInt(initialVideoId!), {
        enabled: isVideoQueryEnabled,
        staleTime: Infinity,
    });

    const videos = useVideos(
        query || {
            pagination: {
                type: "limit_offset",
                limit: VIDEO_SEQUENCE_PAGE_SIZE,
            },
        },
        {
            enabled: videoSource === VideoSource.Videos,
            staleTime: Infinity,
        }
    );

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

    const likes = useLikes(
        query || {
            pagination: { type: "cursor", pageSize: VIDEO_SEQUENCE_PAGE_SIZE },
        },
        { enabled: videoSource === VideoSource.Likes, staleTime: Infinity }
    );

    const videosQuery = (() => {
        switch (videoSource) {
            case VideoSource.Videos:
                return videos;
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
            case VideoSource.Likes:
                return likes;
            default:
                return null;
        }
    })();

    const videoSequence = useRef<VideoSequenceHandle>(null);

    function reset() {
        remove();
        if (videoId && videoId === initialVideoId) void refetch();
        [
            videos,
            recommendedVideos,
            popularVideos,
            latestVideos,
            videoSearch,
            savedVideos,
            followingVideos,
            likes,
        ].forEach((x) => {
            if (x === videosQuery && query) return;
            x.remove();
        });
        setInitialVideoId(videoId);
        setVideoSource(locationState.videoSource || VideoSource.Recommended);
        setQuery(locationState.query);
        setInitialVideoIndex(
            locationState.videoSource && locationState.initialVideoIndex
                ? locationState.initialVideoIndex
                : 0
        );
        setHighlightedCommentId(locationState.highlightedCommentId);
        setHighlightedCommentParentId(locationState.highlightedCommentParentId);
        setVideoQueryEnabled(!locationState.videoSource);
        videoSequence.current?.reset();
    }

    useUpdateEffect(() => {
        if (locationState.videoSource || locationState.highlightedCommentId)
            reset();
    }, [locationState.videoSource, locationState.highlightedCommentId]);

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
                        <Spinner role="progressbar" />
                    </AbsoluteCenter>
                ) : (
                    <VideoSequence
                        ref={videoSequence}
                        videos={allVideos}
                        onFetchMore={() => void videosQuery?.fetchNextPage()}
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
