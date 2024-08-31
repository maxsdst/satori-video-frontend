import { fireEvent, screen, waitFor, within } from "@testing-library/dom";
import { act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadTable from "../../src/components/UploadTable";
import Upload from "../../src/entities/Upload";
import { Filter } from "../../src/services/BaseQuery";
import { getOwnProfile } from "../mocks/db";
import {
    createUpload,
    createUploads,
    createVideo,
    renderWithRouter,
    sort,
} from "../utils";

describe("UploadTable", () => {
    const DEFAULT_PAGE_SIZE = 10;

    describe("loading", () => {
        it("should show spinner while loading", () => {
            const { getSpinner } = renderComponent();

            expect(getSpinner()).toBeInTheDocument();
        });

        it("should hide spinner after loading is complete", async () => {
            const { waitForDataToLoad, getSpinner } = renderComponent();
            await waitForDataToLoad();

            expect(getSpinner()).not.toBeInTheDocument();
        });
    });

    describe("table", () => {
        describe("headers", () => {
            it("should render headers correctly", async () => {
                const { waitForDataToLoad, getTable } = renderComponent();
                await waitForDataToLoad();

                const { headers } = getTable();
                [/file/i, /date created/i, /processed/i].forEach(
                    (name, index) =>
                        expect(headers[index]).toHaveTextContent(name)
                );
            });
        });

        describe("file cell", () => {
            it("should render the cell correctly", async () => {
                const uploads = [
                    createUpload({ isDone: true, video: createVideo({}) }),
                    createUpload({ isDone: false }),
                ];
                sort(uploads, "creation_date", "desc");
                const {
                    waitForDataToLoad,
                    getTable,
                    getCells,
                    getFileCellComponents,
                } = renderComponent();
                await waitForDataToLoad();

                const { rows } = getTable();
                rows.forEach((row, index) => {
                    const upload = uploads[index];
                    const fileCell = getCells(row)[0];
                    const { filename, editVideoButton } =
                        getFileCellComponents(fileCell);
                    expect(filename).toBeInTheDocument();
                    expect(filename).toHaveTextContent(upload.filename);
                    if (upload.is_done)
                        expect(editVideoButton).toBeInTheDocument();
                    else expect(editVideoButton).not.toBeInTheDocument();
                });
            });

            it.each<{
                elementName: "filename" | "editVideoButton";
            }>([
                { elementName: "filename" },
                { elementName: "editVideoButton" },
            ])(
                "should open the edit video modal when $elementName is clicked if upload is processed",
                async ({ elementName }) => {
                    const upload = createUpload({
                        isDone: true,
                        video: createVideo({}),
                    });
                    const {
                        waitForDataToLoad,
                        getTable,
                        getCells,
                        getFileCellComponents,
                        getEditVideoModal,
                        user,
                    } = renderComponent();
                    await waitForDataToLoad();
                    expect(getEditVideoModal().modal).not.toBeInTheDocument();

                    const row = getTable().rows[0];
                    const fileCell = getCells(row)[0];
                    await user.click(
                        getFileCellComponents(fileCell)[elementName]!
                    );

                    const { modal, titleInput } = getEditVideoModal();
                    expect(modal).toBeInTheDocument();
                    expect(titleInput).toHaveValue(upload.video!.title);
                }
            );

            it("should not open the edit video modal when filename is clicked if upload is not processed", async () => {
                createUpload({ isDone: false });
                const {
                    waitForDataToLoad,
                    getTable,
                    getCells,
                    getFileCellComponents,
                    getEditVideoModal,
                    user,
                } = renderComponent();
                await waitForDataToLoad();
                expect(getEditVideoModal().modal).not.toBeInTheDocument();

                const row = getTable().rows[0];
                const fileCell = getCells(row)[0];
                await user.click(getFileCellComponents(fileCell).filename);

                expect(getEditVideoModal().modal).not.toBeInTheDocument();
            });
        });

        describe("date created cell", () => {
            it("should render the cell correctly", async () => {
                createUpload({ creationDate: new Date(2024, 1, 25, 1, 1, 0) });
                createUpload({ creationDate: new Date(2024, 0, 24, 1, 1, 0) });
                const { waitForDataToLoad, getTable, getCells } =
                    renderComponent();
                await waitForDataToLoad();

                const { rows } = getTable();
                [/Feb 25, 2024/i, /Jan 24, 2024/i].forEach((date, index) => {
                    const creationDateCell = getCells(rows[index])[1];
                    expect(creationDateCell).toHaveTextContent(date);
                });
            });
        });

        describe("processed cell", () => {
            it("should render the cell correctly", async () => {
                const uploads = [
                    createUpload({ isDone: true }),
                    createUpload({ isDone: false }),
                ];
                sort(uploads, "creation_date", "desc");
                const {
                    waitForDataToLoad,
                    getTable,
                    getCells,
                    getProcessedCellStatus,
                } = renderComponent();
                await waitForDataToLoad();

                const { rows } = getTable();
                rows.forEach((row, index) => {
                    const processedCell = getCells(row)[2];
                    const status = getProcessedCellStatus(processedCell);
                    expect(status).toHaveAccessibleName(
                        uploads[index].is_done ? /processed/i : /processing/i
                    );
                });
            });
        });
    });

    describe("filtering", () => {
        it("should render correct filtering options", async () => {
            const {
                waitForDataToLoad,
                triggerFilteringPopover,
                getFilteringPopover,
            } = renderComponent();
            await waitForDataToLoad();
            await triggerFilteringPopover();

            const { options } = getFilteringPopover();
            expect(options.length).toBe(2);
            [/filename/i, /processed/i].forEach((name, index) =>
                expect(options[index]).toHaveTextContent(name)
            );
        });

        it.each<{
            name: string;
            filter: Filter;
            arrange: () => Upload[];
            filterUploads: (uploads: Upload[]) => Upload[];
        }>([
            {
                name: "Filename",
                filter: {
                    field: "filename",
                    type: "char",
                    lookupType: "icontains",
                    value: "test 123",
                },
                arrange: () => [
                    ...createUploads(3, {}),
                    ...createUploads(3, { filename: "abc test 123" }),
                ],
                filterUploads: (uploads) =>
                    uploads.filter((upload) =>
                        upload.filename.includes("test 123")
                    ),
            },
            {
                name: "Processed",
                filter: {
                    field: "is_done",
                    type: "boolean",
                    lookupType: "exact",
                    value: true,
                },
                arrange: () => [
                    ...createUploads(3, { isDone: false }),
                    ...createUploads(3, {
                        isDone: true,
                        video: createVideo({}),
                    }),
                ],
                filterUploads: (uploads) =>
                    uploads.filter((upload) => upload.is_done === true),
            },
        ])(
            "should filter uploads when the $name filter is applied",
            async ({ name, filter, arrange, filterUploads }) => {
                const uploads = arrange();
                sort(uploads, "creation_date", "desc");
                const { waitForDataToLoad, applyFilter, getTable } =
                    renderComponent();
                await waitForDataToLoad();
                let rows = getTable().rows;
                expect(rows.length).toBe(uploads.length);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(uploads[index].filename)
                );

                await applyFilter(name, filter);

                const filteredUploads = filterUploads(uploads);
                await waitFor(() => {
                    rows = getTable().rows;
                    expect(rows.length).toBe(filteredUploads.length);
                    rows.forEach((row, index) =>
                        expect(row).toHaveTextContent(
                            filteredUploads[index].filename
                        )
                    );
                });
            }
        );

        it("should filter uploads by filename when the main filtering option is clicked", async () => {
            const text = "test 123";
            const uploads = [
                ...createUploads(3, {}),
                ...createUploads(3, { filename: `abc ${text}` }),
            ];
            sort(uploads, "creation_date", "desc");
            const {
                waitForDataToLoad,
                getFilteringInput,
                getFilteringPopover,
                getTable,
                user,
            } = renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(6);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(uploads[index].filename)
            );

            await user.type(getFilteringInput(), text);
            await user.click(getFilteringPopover().mainOption!);

            const filteredUploads = uploads.filter((video) =>
                video.filename.includes(text)
            );
            await waitFor(() => {
                rows = getTable().rows;
                expect(rows.length).toBe(3);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(
                        filteredUploads[index].filename
                    )
                );
            });
        });
    });

    describe("ordering", () => {
        it("should order uploads by filename when the file column header is clicked", async () => {
            const uploads = createUploads(5, {});
            sort(uploads, "creation_date", "desc");
            const { waitForDataToLoad, getTable, clickHeader } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(5);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(uploads[index].filename)
            );

            await clickHeader(0);
            sort(uploads, "filename", "asc");
            await waitFor(() => {
                rows = getTable().rows;
                expect(rows.length).toBe(5);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(uploads[index].filename)
                );
            });

            await clickHeader(0);
            sort(uploads, "filename", "desc");
            await waitFor(() => {
                rows = getTable().rows;
                expect(rows.length).toBe(5);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(uploads[index].filename)
                );
            });
        });

        it("should order uploads by creation date when the date created column header is clicked", async () => {
            const uploads = createUploads(5, {});
            sort(uploads, "creation_date", "desc");
            const { waitForDataToLoad, getTable, clickHeader } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(5);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(uploads[index].filename)
            );

            await clickHeader(1);
            sort(uploads, "creation_date", "asc");
            await waitFor(() => {
                rows = getTable().rows;
                expect(rows.length).toBe(5);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(uploads[index].filename)
                );
            });

            await clickHeader(1);
            sort(uploads, "creation_date", "desc");
            await waitFor(() => {
                rows = getTable().rows;
                expect(rows.length).toBe(5);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(uploads[index].filename)
                );
            });
        });

        it("should order uploads by processing status when the processed column header is clicked", async () => {
            const uploads = [
                createUpload({ isDone: true }),
                createUpload({ isDone: false }),
            ];
            sort(uploads, "creation_date", "desc");
            const { waitForDataToLoad, getTable, clickHeader } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(2);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(uploads[index].filename)
            );

            await clickHeader(2);
            sort(uploads, "is_done", "desc");
            await waitFor(() => {
                rows = getTable().rows;
                expect(rows.length).toBe(2);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(uploads[index].filename)
                );
            });

            await clickHeader(2);
            sort(uploads, "is_done", "asc");
            await waitFor(() => {
                rows = getTable().rows;
                expect(rows.length).toBe(2);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(uploads[index].filename)
                );
            });
        });
    });

    describe("pagination", () => {
        it("should show next page when the next button is clicked", async () => {
            const uploads = createUploads(DEFAULT_PAGE_SIZE * 3, {});
            sort(uploads, "creation_date", "desc");
            const { waitForDataToLoad, getTable, nextPage } = renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            let page = uploads.slice(0, DEFAULT_PAGE_SIZE);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].filename)
            );

            await nextPage();
            rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            page = uploads.slice(DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE * 2);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].filename)
            );

            await nextPage();
            rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            page = uploads.slice(DEFAULT_PAGE_SIZE * 2, DEFAULT_PAGE_SIZE * 3);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].filename)
            );
        });

        it("should show previous page when the previous button is clicked", async () => {
            const uploads = createUploads(DEFAULT_PAGE_SIZE * 2, {});
            sort(uploads, "creation_date", "desc");
            const { waitForDataToLoad, getTable, nextPage, previousPage } =
                renderComponent();
            await waitForDataToLoad();
            await nextPage();
            let rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            let page = uploads.slice(DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE * 2);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].filename)
            );

            await previousPage();
            rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            page = uploads.slice(0, DEFAULT_PAGE_SIZE);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].filename)
            );
        });

        it("should change page size when page size is selected", async () => {
            const uploads = createUploads(50, {});
            sort(uploads, "creation_date", "desc");
            const { waitForDataToLoad, getTable, changePageSize } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(uploads[index].filename)
            );

            await changePageSize(30);

            rows = getTable().rows;
            expect(rows.length).toBe(30);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(uploads[index].filename)
            );
        });
    });

    describe("editing video", () => {
        it("should refresh table after video is edited", async () => {
            const uploads = [
                createUpload({ creationDate: new Date() }),
                createUpload({
                    creationDate: new Date(Date.now() - 1000),
                    isDone: true,
                    video: createVideo({ profile: getOwnProfile() }),
                }),
                createUpload({
                    creationDate: new Date(Date.now() - 2000),
                }),
            ];
            const { waitForDataToLoad, getTable, editVideo } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(3);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(uploads[index].filename)
            );

            await editVideo(rows[1], "abc");

            rows = getTable().rows;
            expect(rows.length).toBe(2);
            expect(rows[0]).toHaveTextContent(uploads[0].filename);
            expect(rows[1]).toHaveTextContent(uploads[2].filename);
        });
    });
});

function renderComponent(useAppRoutes?: boolean) {
    const { getLocation } = renderWithRouter(<UploadTable />, useAppRoutes);

    const getSpinner = () => screen.queryByRole("progressbar");

    const getFilteringInput = () => screen.getByPlaceholderText(/filter/i);

    const getFilteringPopover = () => {
        const popover = screen.queryByRole("dialog", {
            name: /filtering options/i,
        });
        return {
            popover,
            options: popover ? within(popover).queryAllByRole("listitem") : [],
            mainOption:
                popover &&
                within(popover).queryByRole("listitem", { name: /contains/i }),
        };
    };

    const getCharFilterModal = (name: string) => {
        const modal = screen.queryByRole("dialog", { name });
        return {
            modal,
            valueInput: modal && within(modal).getByPlaceholderText(/value/i),
            applyButton:
                modal && within(modal).getByRole("button", { name: /apply/i }),
            error: modal && within(modal).queryByRole("alert"),
        };
    };

    const getNumberFilterModal = (name: string) => {
        const modal = screen.queryByRole("dialog", { name });
        const lookupTypeSelect = modal && within(modal).getByRole("combobox");
        return {
            modal,
            lookupTypeSelect,
            getOption: (lookupType: "gte" | "lte") =>
                within(lookupTypeSelect!).getByRole("option", {
                    name: lookupType === "gte" ? ">=" : "<=",
                }),
            valueInput: modal && within(modal).getByPlaceholderText(/value/i),
            applyButton:
                modal && within(modal).getByRole("button", { name: /apply/i }),
        };
    };

    const getBooleanFilterModal = (name: string) => {
        const modal = screen.queryByRole("dialog", { name });
        return {
            modal,
            yesOption:
                modal && within(modal).getByRole("radio", { name: /yes/i }),
            noOption:
                modal && within(modal).getByRole("radio", { name: /no/i }),
            applyButton:
                modal && within(modal).getByRole("button", { name: /apply/i }),
        };
    };

    const getTable = () => {
        const table = screen.getByRole("table");
        const [head, body] = within(table).getAllByRole("rowgroup");
        return {
            headers: within(head).queryAllByRole("columnheader"),
            rows: within(body).queryAllByRole("row"),
        };
    };
    const getCells = (row: HTMLElement) => within(row).queryAllByRole("cell");

    const getFileCellComponents = (cell: HTMLElement) => {
        return {
            filename: within(cell).getByLabelText(/filename/i),
            editVideoButton: within(cell).queryByLabelText(/edit video/i),
        };
    };

    const getEditVideoModal = () => {
        const modal = screen.queryByRole("dialog", { name: /edit video/i });
        const titleInputGroup =
            modal && within(modal).getByRole("group", { name: /title/i });
        return {
            modal,
            titleInput:
                titleInputGroup && within(titleInputGroup).getByRole("textbox"),
            saveButton:
                modal && within(modal).getByRole("button", { name: /save/i }),
        };
    };

    const getProcessedCellStatus = (cell: HTMLElement) =>
        within(cell).getByRole("status");

    const getPaginator = () => {
        const paginator = screen.getByTestId("paginator");
        return {
            paginator,
            previousButton: within(paginator).getByRole("button", {
                name: "<",
            }),
            nextButton: within(paginator).getByRole("button", { name: ">" }),
            pageSizeMenuButton: within(paginator).getByRole("button", {
                name: /page/i,
            }),
        };
    };

    const user = userEvent.setup();

    const waitForDataToLoad = () =>
        waitFor(() => expect(getSpinner()).not.toBeInTheDocument());

    const triggerFilteringPopover = () => user.click(getFilteringInput());

    const applyFilter = async (optionName: string, filter: Filter) => {
        await triggerFilteringPopover();
        const { popover } = getFilteringPopover();
        const option = within(popover!).getByRole("listitem", {
            name: optionName,
        });
        await user.click(option);

        switch (filter.type) {
            case "char": {
                const { valueInput, applyButton } =
                    getCharFilterModal(optionName);
                await user.type(valueInput!, filter.value);
                await user.click(applyButton!);
                return;
            }

            case "number": {
                const { lookupTypeSelect, getOption, valueInput, applyButton } =
                    getNumberFilterModal(optionName);
                await user.selectOptions(
                    lookupTypeSelect!,
                    getOption(filter.lookupType)
                );
                await user.type(valueInput!, filter.value.toString());
                await user.click(applyButton!);
                return;
            }

            case "boolean": {
                const { yesOption, noOption, applyButton } =
                    getBooleanFilterModal(optionName);
                await user.click(filter.value ? yesOption! : noOption!);
                await user.click(applyButton!);
                return;
            }
        }
    };

    const clickHeader = async (columnIndex: number) => {
        const header = getTable().headers[columnIndex];
        const button = within(header).getByRole("button");
        await act(async () => {
            fireEvent.click(button);
            await new Promise((r) => setTimeout(r, 0));
        });
    };

    const nextPage = () => user.click(getPaginator().nextButton);
    const previousPage = () => user.click(getPaginator().previousButton);
    const changePageSize = async (pageSize: 10 | 30 | 50) => {
        await user.click(getPaginator().pageSizeMenuButton);
        const menu = screen.getByRole("menu");
        const menuItem = within(menu).getByRole("menuitemradio", {
            name: new RegExp(pageSize.toString()),
        });
        await user.click(menuItem);
    };

    const editVideo = async (row: HTMLElement, title: string) => {
        const videoCell = getCells(row)[0];
        await user.click(getFileCellComponents(videoCell).editVideoButton!);
        const { titleInput, saveButton } = getEditVideoModal();
        await user.clear(titleInput!);
        await user.type(titleInput!, title);
        await user.click(saveButton!);
    };

    return {
        getLocation,
        getSpinner,
        getFilteringInput,
        getFilteringPopover,
        getTable,
        getCells,
        getFileCellComponents,
        getEditVideoModal,
        getProcessedCellStatus,
        user,
        waitForDataToLoad,
        triggerFilteringPopover,
        applyFilter,
        clickHeader,
        nextPage,
        previousPage,
        changePageSize,
        editVideo,
    };
}
