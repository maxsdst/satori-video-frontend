import { HttpHandler, HttpResponse, http } from "msw";
import HistoryEntry from "../../../src/entities/HistoryEntry";
import { db, getOwnProfile } from "../db";
import { paginateResults } from "./HandlerGenerator";
import { BASE_URL } from "./constants";

const handlers: HttpHandler[] = [
    http.get(BASE_URL + "/videos/history/grouped_by_date/", ({ request }) => {
        const entries = db.historyEntry.findMany({
            where: { profile: { equals: getOwnProfile().id } },
            orderBy: { creation_date: "desc" },
        });
        const response = paginateResults(request, "cursor", entries);
        response.results = groupHistoryEntriesByDate(
            response.results as HistoryEntry[]
        );
        return HttpResponse.json(response);
    }),

    http.post(
        BASE_URL + "/videos/history/remove_video_from_history/",
        async ({ request }) => {
            const data = (await request.json()) as { video: number };
            const videoId = data.video;

            db.historyEntry.deleteMany({
                where: {
                    profile: { equals: getOwnProfile().id },
                    video: { id: { equals: videoId } },
                },
            });

            return new HttpResponse(null, { status: 200 });
        }
    ),
];

interface EntryGroup {
    date: string;
    entries: HistoryEntry[];
}

function groupHistoryEntriesByDate(
    historyEntries: HistoryEntry[]
): EntryGroup[] {
    if (historyEntries.length === 0) return [];

    const results = [];
    let lastDate = getDatePart(historyEntries[0].creation_date);
    let entries: HistoryEntry[] = [];

    for (const entry of historyEntries) {
        const date = getDatePart(entry.creation_date);

        if (date != lastDate) {
            results.push({ date: lastDate, entries: entries });
            lastDate = date;
            entries = [];
        }

        entries.push(entry);
    }

    results.push({ date: lastDate, entries: entries });

    return results;
}

function getDatePart(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export default handlers;
