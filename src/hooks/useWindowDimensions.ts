import { useSyncExternalStore } from "react";

interface WindowDimensions {
    width: number;
    height: number;
}

export function useWindowDimensions() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

function subscribe(callback: () => void) {
    const events = ["resize", "fullscreenchange"];
    events.forEach((event) => window.addEventListener(event, callback));
    return () =>
        events.forEach((event) => window.removeEventListener(event, callback));
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
