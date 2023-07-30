import { DraggableData } from "react-draggable";

interface SliderState {
    x: number;
    y: number;
    currentSlideIndex: number;
    transition?: boolean;
    dragStartY?: number;
    dragStartTime?: number;
}

interface Action {
    type: "HANDLE_DRAG_START" | "HANDLE_DRAG_STOP";
    dragData: DraggableData;
    slides?: HTMLCollection;
}

function getSlide(index: number, slides?: HTMLCollection): HTMLElement | null {
    return slides?.[index] ? (slides[index] as HTMLElement) : null;
}

function shouldGoToNext(y: number, currentSlide: HTMLElement): boolean {
    return 0 - y > currentSlide.offsetTop + currentSlide.offsetHeight / 2;
}

function shouldGoToPrev(y: number, currentSlide: HTMLElement): boolean {
    return 0 - y < currentSlide.offsetTop - currentSlide.offsetHeight / 2;
}

function isSwipe(
    y: number,
    dragStartY?: number,
    dragStartTime?: number
): boolean {
    const SWIPE_MIN_DISTANCE_PX = 10;
    const SWIPE_MAX_DURATION_MS = 250;

    if (
        typeof dragStartY === "undefined" ||
        typeof dragStartTime === "undefined"
    )
        return false;

    return (
        Math.abs(y - dragStartY) > SWIPE_MIN_DISTANCE_PX &&
        Date.now() - dragStartTime < SWIPE_MAX_DURATION_MS
    );
}

function isSwipeUp(
    y: number,
    dragStartY?: number,
    dragStartTime?: number
): boolean {
    return isSwipe(y, dragStartY, dragStartTime) && dragStartY! > y;
}

function isSwipeDown(
    y: number,
    dragStartY?: number,
    dragStartTime?: number
): boolean {
    return isSwipe(y, dragStartY, dragStartTime) && dragStartY! < y;
}

function verticalSliderReducer(
    state: SliderState,
    action: Action
): SliderState {
    const prevSlide = getSlide(state.currentSlideIndex - 1, action.slides);
    const currentSlide = getSlide(state.currentSlideIndex, action.slides);
    const nextSlide = getSlide(state.currentSlideIndex + 1, action.slides);

    switch (action.type) {
        case "HANDLE_DRAG_START":
            return {
                ...state,
                transition: false,
                dragStartY: action.dragData.y,
                dragStartTime: Date.now(),
            };

        case "HANDLE_DRAG_STOP":
            if (
                nextSlide &&
                (isSwipeUp(
                    action.dragData.y,
                    state.dragStartY,
                    state.dragStartTime
                ) ||
                    shouldGoToNext(action.dragData.y, currentSlide!))
            )
                return {
                    x: 0,
                    y: 0 - nextSlide.offsetTop,
                    currentSlideIndex: state.currentSlideIndex + 1,
                    transition: true,
                };

            if (
                prevSlide &&
                (isSwipeDown(
                    action.dragData.y,
                    state.dragStartY,
                    state.dragStartTime
                ) ||
                    shouldGoToPrev(action.dragData.y, currentSlide!))
            )
                return {
                    x: 0,
                    y: 0 - prevSlide.offsetTop,
                    currentSlideIndex: state.currentSlideIndex - 1,
                    transition: true,
                };

            return { ...state, transition: true };
    }

    return state;
}

export default verticalSliderReducer;
