import { Box, VStack } from "@chakra-ui/react";
import {
    ReactElement,
    Ref,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useReducer,
    useRef,
} from "react";
import Draggable from "react-draggable";
import WheelIndicator from "wheel-indicator";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import verticalSliderReducer from "./verticalSliderReducer";

interface Props {
    children?: ReactElement[];
    isDraggable: boolean;
    spaceBetweenSlides: string;
    onSlideChange: (slideIndex: number) => void;
    isDisabled: boolean;
}

export interface VerticalSliderHandle {
    goToNext: () => void;
    goToPrev: () => void;
}

const VerticalSlider = forwardRef(function VerticalSlider(
    {
        isDraggable,
        children,
        spaceBetweenSlides,
        onSlideChange,
        isDisabled,
    }: Props,
    ref: Ref<VerticalSliderHandle>
) {
    const NEXT_SLIDE_KEYS = ["ArrowDown", "PageDown"];
    const PREV_SLIDE_KEYS = ["ArrowUp", "PageUp"];

    const [state, dispatch] = useReducer(verticalSliderReducer, {
        x: 0,
        y: 0,
        currentSlideIndex: 0,
        isDisabled,
    });

    useEffect(() => {
        isDisabled
            ? dispatch({ type: "DISABLE" })
            : dispatch({ type: "ENABLE" });
    }, [isDisabled]);

    useEffect(
        () => onSlideChange(state.currentSlideIndex),
        [state.currentSlideIndex]
    );

    const slidesContainer = useRef<HTMLDivElement>(null);
    const slides = slidesContainer.current?.children;

    useEffect(() => {
        if (!slidesContainer.current) return;

        const wheelIndicator = new WheelIndicator({
            elem: slidesContainer.current,
            callback: (e) => {
                e.direction === "down"
                    ? dispatch({
                          type: "GO_TO_NEXT_SLIDE",
                          slides: slidesContainer.current?.children,
                      })
                    : dispatch({
                          type: "GO_TO_PREV_SLIDE",
                          slides: slidesContainer.current?.children,
                      });
            },
            preventMouse: false,
        });

        return () => {
            wheelIndicator.destroy();
        };
    }, [slidesContainer]);

    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        dispatch({ type: "HANDLE_WINDOW_RESIZED", slides });
    }, [windowDimensions]);

    useImperativeHandle(ref, () => ({
        goToNext() {
            dispatch({
                type: "GO_TO_NEXT_SLIDE",
                slides: slidesContainer.current?.children,
            });
        },
        goToPrev() {
            dispatch({
                type: "GO_TO_PREV_SLIDE",
                slides: slidesContainer.current?.children,
            });
        },
    }));

    return (
        <Box
            height="100%"
            position="relative"
            overflowY="hidden"
            tabIndex={1}
            _focus={{ outline: "0" }}
            onKeyDown={(e) => {
                if (NEXT_SLIDE_KEYS.includes(e.key))
                    dispatch({ type: "GO_TO_NEXT_SLIDE", slides });
                else if (PREV_SLIDE_KEYS.includes(e.key))
                    dispatch({ type: "GO_TO_PREV_SLIDE", slides });
            }}
        >
            <Draggable
                axis="y"
                disabled={!isDraggable}
                position={state}
                onStart={(_, data) =>
                    dispatch({
                        type: "HANDLE_DRAG_START",
                        dragData: data,
                        slides,
                    })
                }
                onStop={(_, data) =>
                    dispatch({
                        type: "HANDLE_DRAG_STOP",
                        dragData: data,
                        slides,
                    })
                }
            >
                <VStack
                    position="relative"
                    spacing={spaceBetweenSlides}
                    transition={state.transition ? "transform 0.5s" : undefined}
                    ref={slidesContainer}
                >
                    {children}
                </VStack>
            </Draggable>
        </Box>
    );
});

export default VerticalSlider;
