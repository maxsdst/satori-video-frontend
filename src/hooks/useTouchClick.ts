import { RefObject, useEffect, useRef } from "react";

function useTouchClick(ref: RefObject<HTMLElement>, handler: () => void) {
    const CLICK_THRESHOLD = 5;

    const startX = useRef(0);
    const startY = useRef(0);
    const endX = useRef(0);
    const endY = useRef(0);

    function isClick() {
        const deltaX = endX.current - startX.current;
        const deltaY = endY.current - startY.current;
        return (
            Math.abs(deltaX) < CLICK_THRESHOLD &&
            Math.abs(deltaY) < CLICK_THRESHOLD
        );
    }

    useEffect(() => {
        const touchStartHandler = (e: TouchEvent) => {
            startX.current = e.touches[0].clientX;
            startY.current = e.touches[0].clientY;
        };

        const touchEndHandler = (e: TouchEvent) => {
            endX.current = e.changedTouches[0].clientX;
            endY.current = e.changedTouches[0].clientY;
            if (isClick()) handler();
        };

        if (ref.current) {
            ref.current.addEventListener("touchstart", touchStartHandler);
            ref.current.addEventListener("touchend", touchEndHandler);
        }

        return () => {
            if (ref.current) {
                ref.current.removeEventListener(
                    "touchstart",
                    touchStartHandler
                );
                ref.current.removeEventListener("touchend", touchEndHandler);
            }
        };
    }, [ref, handler]);
}

export default useTouchClick;
