import { createContext } from "react";
import Video from "../../entities/Video";

interface VideoPageContextType {
    fetchedVideos: Video[];
}

const VideoPageContext = createContext<VideoPageContextType>(
    {} as VideoPageContextType
);

export default VideoPageContext;
