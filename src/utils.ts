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

export function getLineHeightInPx(element: Element): number {
    const styles = getComputedStyle(element);
    const lineHeightValue = styles.getPropertyValue("line-height");

    if (isNumber(lineHeightValue)) {
        const fontSizeValue = styles.getPropertyValue("font-size");

        if (isPxValue(fontSizeValue)) {
            const fontSize = new Number(fontSizeValue.slice(0, -2)) as number;
            const lineHeight = new Number(lineHeightValue) as number;
            return fontSize * lineHeight;
        }

        throw `Unknown CSS unit: ${fontSizeValue}`;
    }

    if (isPxValue(lineHeightValue))
        return new Number(lineHeightValue.slice(0, -2)) as number;

    throw `Unknown CSS unit: ${lineHeightValue}`;
}

function isNumber(str: string) {
    return str ? !isNaN(new Number(str) as number) : false;
}

function isPxValue(str: string) {
    return str.endsWith("px");
}
