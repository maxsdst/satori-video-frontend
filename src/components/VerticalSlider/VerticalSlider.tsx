import { Box, VStack } from "@chakra-ui/react";
import { ReactElement, useEffect, useReducer, useRef } from "react";
import Draggable from "react-draggable";
import verticalSliderReducer from "./verticalSliderReducer";

interface Props {
    children?: ReactElement[];
    spaceBetweenSlides: string;
    onSlideChange: (slideIndex: number) => void;
}

function VerticalSlider({
    children,
    spaceBetweenSlides,
    onSlideChange,
}: Props) {
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
}

export default VerticalSlider;
