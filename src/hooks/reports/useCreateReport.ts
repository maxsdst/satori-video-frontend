import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import reportService from "../../services/reportService";

export enum ReportReason {
    Sex = "sex",
    Violence = "violence",
    Hate = "hate",
    Harassment = "harassment",
    Danger = "danger",
    Misinformation = "misinformation",
    ChildAbuse = "child_abuse",
    Terrorism = "terrorism",
    Spam = "spam",
}

export const REPORT_REASON_DESCRIPTIONS: Record<ReportReason, string> = {
    [ReportReason.Sex]: "Sexual content",
    [ReportReason.Violence]: "Violent or repulsive content",
    [ReportReason.Hate]: "Hateful or abusive content",
    [ReportReason.Harassment]: "Harassment or bullying",
    [ReportReason.Danger]: "Harmful or dangerous acts",
    [ReportReason.Misinformation]: "Misinformation",
    [ReportReason.ChildAbuse]: "Child abuse",
    [ReportReason.Terrorism]: "Promotes terrorism",
    [ReportReason.Spam]: "Spam or misleading",
};

interface ReportData {
    videoId: number;
    reason: ReportReason;
}

interface ErrorData {
    video?: string[];
    reason?: string[];
}

interface UseCreateReportOptions {
    onError?: (data: ErrorData) => void;
}

function useCreateReport({ onError }: UseCreateReportOptions) {
    return useMutation<null, AxiosError<ErrorData>, ReportData>({
        mutationFn: (data) =>
            reportService.post({
                video: data.videoId,
                reason: data.reason,
            }),
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
        },
    });
}

export default useCreateReport;
