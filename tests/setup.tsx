import { drop } from "@mswjs/data";
import "@testing-library/jest-dom/vitest";
import { db, deleteOwnProfile } from "./mocks/db";
import { server } from "./mocks/server";

afterEach(() => {
    vi.restoreAllMocks();
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

afterEach(() => drop(db));
afterEach(() => deleteOwnProfile());
