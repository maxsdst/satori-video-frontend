import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import commentReportService from "../services/commentReportService";

export enum ReportReason {
    Spam = "spam",
    Pornography = "pornography",
    ChildAbuse = "child_abuse",
    HateSpeech = "hate_speech",
    Terrorism = "terrorism",
    Harassment = "harassment",
    Suicide = "suicide",
    Misinformation = "misinformation",
}

export const REPORT_REASON_DESCRIPTIONS: Record<ReportReason, string> = {
    [ReportReason.Spam]: "Unwanted commercial content or spam",
    [ReportReason.Pornography]: "Pornography or sexually explicit material",
    [ReportReason.ChildAbuse]: "Child abuse",
    [ReportReason.HateSpeech]: "Hate speech or graphic violence",
    [ReportReason.Terrorism]: "Promotes terrorism",
    [ReportReason.Harassment]: "Harassment or bullying",
    [ReportReason.Suicide]: "Suicide or self injury",
    [ReportReason.Misinformation]: "Misinformation",
};

interface CommentReportData {
    commentId: number;
    reason: ReportReason;
}

interface ErrorData {
    comment?: string[];
    reason?: string[];
}

interface UseCreateCommentReportOptions {
    onError?: (data: ErrorData) => void;
}

function useCreateCommentReport({ onError }: UseCreateCommentReportOptions) {
    return useMutation<null, AxiosError<ErrorData>, CommentReportData>({
        mutationFn: (data) =>
            commentReportService.post({
                comment: data.commentId,
                reason: data.reason,
            }),
        onError: (error) => {
            if (error.response?.data) onError?.(error.response.data);
        },
    });
}

export default useCreateCommentReport;
