import { Button, ButtonProps, Icon } from "@chakra-ui/react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { MAIN_CONTENT_AREA_PADDING } from "../../styleConstants";

interface Props {
    showUp: boolean;
    showDown: boolean;
    onUp: () => void;
    onDown: () => void;
}

function Navigation({ showUp, showDown, onUp, onDown }: Props) {
    const buttonProps: ButtonProps = {
        position: "absolute",
        right: 0,
        borderRadius: "50%",
        width: 0,
        padding: 7,
    };

    const iconBoxSize = 6;

    return (
        <>
            {showUp && (
                <Button top="0" onClick={onUp} {...buttonProps}>
                    <Icon as={AiOutlineArrowUp} boxSize={iconBoxSize} />
                </Button>
            )}
            {showDown && (
                <Button
                    bottom={MAIN_CONTENT_AREA_PADDING}
                    onClick={onDown}
                    {...buttonProps}
                >
                    <Icon as={AiOutlineArrowDown} boxSize={iconBoxSize} />
                </Button>
            )}
        </>
    );
}

export default Navigation;
