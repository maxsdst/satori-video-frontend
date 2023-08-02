import { useSyncExternalStore } from "react";

interface WindowDimensions {
    width: number;
    height: number;
}

export function useWindowDimensions() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

function subscribe(callback: () => void) {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
}

let prevDimensions: WindowDimensions | undefined = undefined;

function getSnapshot(): WindowDimensions {
    if (
        !prevDimensions ||
        prevDimensions.width !== window.innerWidth ||
        prevDimensions.height !== window.innerHeight
    )
        prevDimensions = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

    return prevDimensions;
}
