import { createContext } from "react";

interface PlayerContextType {
    width: string;
    height: string;
    minWidth?: string;
    minHeight?: string;
    isFullscreen: boolean;
    borderRadius: string;
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType);

export default PlayerContext;
