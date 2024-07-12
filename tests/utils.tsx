export function replaceQueryParam(url: string, name: string, value: string) {
    const urlObj = new URL(url);
    urlObj.searchParams.set(name, value);
    return urlObj.toString();
}
