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
import verticalSliderReducer from "./verticalSliderReducer";

interface Props {
    children?: ReactElement[];
    spaceBetweenSlides: string;
    onSlideChange: (slideIndex: number) => void;
}

export interface VerticalSliderHandle {
    goToNext: () => void;
    goToPrev: () => void;
}

const VerticalSlider = forwardRef(function VerticalSlider(
    { children, spaceBetweenSlides, onSlideChange }: Props,
    ref: Ref<VerticalSliderHandle>
) {
    const [state, dispatch] = useReducer(verticalSliderReducer, {
        x: 0,
        y: 0,
        currentSlideIndex: 0,
    });

    useEffect(
        () => onSlideChange(state.currentSlideIndex),
        [state.currentSlideIndex]
    );

    const slidesContainer = useRef<HTMLDivElement>(null);
    const slides = slidesContainer.current?.children;

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
        <Box height="100%" position="relative" overflowY="hidden">
            <Draggable
                axis="y"
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
