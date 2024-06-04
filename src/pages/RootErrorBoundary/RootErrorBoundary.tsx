import { HttpStatusCode, isAxiosError } from "axios";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import Error from "./Error";

function RootErrorBoundary() {
    const error: any = useRouteError();

    if (
        (isRouteErrorResponse(error) &&
            error.status === HttpStatusCode.NotFound) ||
        (isAxiosError(error) &&
            error.response?.status === HttpStatusCode.NotFound)
    ) {
        return (
            <Error imageSrc="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGxpNXpweTl2cXI3ZThyaHNpN205M2FocTdpOHVyMm12ZjdxZms5dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zBOqRPmkEF3Ow/giphy.gif">
                This page doesn't exist.
            </Error>
        );
    }

    return (
        <Error imageSrc="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWVkZDRranJsZHdtaHl2ZDBrMnBmeTl6NXY0NnluOWQzMGo1dnptMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VbAFrrDVGAvZu/giphy-downsized.gif">
            Something went wrong.
        </Error>
    );
}

export default RootErrorBoundary;
