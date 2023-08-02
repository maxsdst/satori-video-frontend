import { PORTRAIT_MODE_ASPECT_RATIO } from "./styleConstants";

export function isInPortraitMode(width: number, height: number) {
    return width / height < PORTRAIT_MODE_ASPECT_RATIO;
}
