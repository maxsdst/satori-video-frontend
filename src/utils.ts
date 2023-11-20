import numbro from "numbro";
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

export function insertIf<T>(condition: boolean, element: T): T[] {
    return condition ? [element] : [];
}

export function formatNumber(number: number): string {
    if (number < 1_000) return number.toString();

    let format = null;

    if (number < 10_000)
        format = { average: true, mantissa: 1, trimMantissa: true };
    else if (number < 1_000_000) format = { average: true };
    else format = { average: true, mantissa: 1, trimMantissa: true };

    return numbro(number).format(format).toUpperCase();
}
