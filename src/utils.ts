import { PORTRAIT_MODE_ASPECT_RATIO } from "./styleConstants";

export function isInPortraitMode(width: number, height: number) {
    return width / height < PORTRAIT_MODE_ASPECT_RATIO;
}

export function isTouchDevice(): boolean {
    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
    );
}

export function convertDateToString(date: Date) {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "June",
        "July",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
    ];

    return `${
        months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
}
