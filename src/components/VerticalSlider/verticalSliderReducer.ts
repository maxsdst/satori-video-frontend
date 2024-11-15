import { DraggableData } from "react-draggable";

export interface SliderState {
    x: number;
    y: number;
    currentSlideIndex: number;
    isDisabled: boolean;
    transition?: boolean;
    dragStartY?: number;
    dragStartTime?: number;
}

interface GoToSlideAction {
    type: "GO_TO_NEXT_SLIDE" | "GO_TO_PREV_SLIDE" | "GO_TO_SLIDE";
    slides?: HTMLCollection;
    slideIndex?: number;
}

interface HandleDragAction {
    type: "HANDLE_DRAG_START" | "HANDLE_DRAG_STOP";
    dragData: DraggableData;
    slides?: HTMLCollection;
}

interface SetDisabledAction {
    type: "DISABLE" | "ENABLE";
}

interface HandleWindowResizedAction {
    type: "HANDLE_WINDOW_RESIZED";
    slides?: HTMLCollection;
}

interface ResetAction {
    type: "RESET";
    state: SliderState;
}

type Action =
    | GoToSlideAction
    | HandleDragAction
    | SetDisabledAction
    | HandleWindowResizedAction
    | ResetAction;

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
    switch (action.type) {
        case "RESET":
            return action.state;
        case "DISABLE":
            return { ...state, isDisabled: true };
        case "ENABLE":
            return { ...state, isDisabled: false };
    }

    if (state.isDisabled) return state;

    const prevSlide = getSlide(state.currentSlideIndex - 1, action.slides);
    const currentSlide = getSlide(state.currentSlideIndex, action.slides);
    const nextSlide = getSlide(state.currentSlideIndex + 1, action.slides);

    switch (action.type) {
        case "GO_TO_NEXT_SLIDE":
            if (!nextSlide) return state;
            return {
                ...state,
                x: 0,
                y: 0 - nextSlide.offsetTop,
                currentSlideIndex: state.currentSlideIndex + 1,
                transition: true,
            };

        case "GO_TO_PREV_SLIDE":
            if (!prevSlide) return state;
            return {
                ...state,
                x: 0,
                y: 0 - prevSlide.offsetTop,
                currentSlideIndex: state.currentSlideIndex - 1,
                transition: true,
            };

        case "GO_TO_SLIDE":
            if (!action.slideIndex) return state;
            const slide = getSlide(action.slideIndex, action.slides);
            if (!slide) return state;

            return {
                ...state,
                x: 0,
                y: 0 - slide.offsetTop,
                currentSlideIndex: action.slideIndex,
                transition: false,
            };

        case "HANDLE_DRAG_START":
            return {
                ...state,
                transition: false,
                dragStartY: action.dragData.y,
                dragStartTime: Date.now(),
            };

        case "HANDLE_DRAG_STOP":
            state = { ...state, transition: true };

            if (
                isSwipeUp(
                    action.dragData.y,
                    state.dragStartY,
                    state.dragStartTime
                ) ||
                shouldGoToNext(action.dragData.y, currentSlide!)
            )
                return verticalSliderReducer(state, {
                    type: "GO_TO_NEXT_SLIDE",
                    slides: action.slides,
                });

            if (
                isSwipeDown(
                    action.dragData.y,
                    state.dragStartY,
                    state.dragStartTime
                ) ||
                shouldGoToPrev(action.dragData.y, currentSlide!)
            )
                return verticalSliderReducer(state, {
                    type: "GO_TO_PREV_SLIDE",
                    slides: action.slides,
                });

            return state;

        case "HANDLE_WINDOW_RESIZED":
            if (!currentSlide) return state;
            return {
                ...state,
                x: 0,
                y: 0 - currentSlide.offsetTop,
                transition: false,
            };
    }

    return state;
}

export default verticalSliderReducer;
