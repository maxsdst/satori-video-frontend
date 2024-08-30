import { fireEvent, screen, waitFor, within } from "@testing-library/dom";
import { act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VideoTable from "../../src/components/VideoTable";
import Video from "../../src/entities/Video";
import { Filter } from "../../src/services/BaseQuery";
import { getOwnProfile } from "../mocks/db";
import {
    createVideo,
    createVideos,
    renderWithRouter,
    sortVideos,
} from "../utils";

describe("VideoTable", () => {
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
                [/video/i, /upload date/i, /views/i, /likes/i].forEach(
                    (name, index) =>
                        expect(headers[index]).toHaveTextContent(name)
                );
            });
        });

        describe("video cell", () => {
            it("should render the cell correctly", async () => {
                const videos = createVideos(3, { profile: getOwnProfile() });
                sortVideos(videos, "upload_date", "desc");
                const {
                    waitForDataToLoad,
                    getTable,
                    getCells,
                    getVideoCellComponents,
                } = renderComponent();
                await waitForDataToLoad();

                const { rows } = getTable();
                rows.forEach((row, index) => {
                    const videoCell = getCells(row)[0];
                    const {
                        thumbnail,
                        title,
                        description,
                        editButton,
                        viewButton,
                        deleteButton,
                    } = getVideoCellComponents(videoCell);
                    expect(thumbnail).toBeInTheDocument();
                    expect(thumbnail).toHaveAttribute(
                        "src",
                        videos[index].thumbnail
                    );
                    expect(title).toBeInTheDocument();
                    expect(title).toHaveTextContent(videos[index].title);
                    expect(description).toBeInTheDocument();
                    expect(description).toHaveTextContent(
                        videos[index].description
                    );
                    expect(editButton).toBeInTheDocument();
                    expect(viewButton).toBeInTheDocument();
                    expect(deleteButton).toBeInTheDocument();
                });
            });

            it.each<{ elementName: "thumbnail" | "title" | "editButton" }>([
                { elementName: "thumbnail" },
                { elementName: "title" },
                { elementName: "editButton" },
            ])(
                "should open the edit video modal when $elementName is clicked",
                async ({ elementName }) => {
                    const video = createVideo({ profile: getOwnProfile() });
                    const {
                        waitForDataToLoad,
                        getTable,
                        getCells,
                        getVideoCellComponents,
                        getEditVideoModal,
                        user,
                    } = renderComponent();
                    await waitForDataToLoad();
                    expect(getEditVideoModal().modal).not.toBeInTheDocument();

                    const row = getTable().rows[0];
                    const videoCell = getCells(row)[0];
                    await user.click(
                        getVideoCellComponents(videoCell)[elementName]
                    );

                    const { modal, titleInput } = getEditVideoModal();
                    expect(modal).toBeInTheDocument();
                    expect(titleInput).toHaveValue(video.title);
                }
            );

            it("should redirect to the video page when the view button is clicked", async () => {
                const video = createVideo({ profile: getOwnProfile() });
                const pathname = `/videos/${video.id}`;
                const {
                    waitForDataToLoad,
                    getTable,
                    getCells,
                    getVideoCellComponents,
                    getLocation,
                    user,
                } = renderComponent();
                await waitForDataToLoad();
                expect(getLocation().pathname).not.toBe(pathname);

                const row = getTable().rows[0];
                const videoCell = getCells(row)[0];
                await user.click(getVideoCellComponents(videoCell).viewButton);

                expect(getLocation().pathname).toBe(pathname);
            });

            it("should open the delete video modal when the delete button is clicked", async () => {
                const video = createVideo({ profile: getOwnProfile() });
                const {
                    waitForDataToLoad,
                    getTable,
                    getCells,
                    getVideoCellComponents,
                    getDeleteVideoModal,
                    user,
                } = renderComponent();
                await waitForDataToLoad();
                expect(getDeleteVideoModal().modal).not.toBeInTheDocument();

                const row = getTable().rows[0];
                const videoCell = getCells(row)[0];
                await user.click(
                    getVideoCellComponents(videoCell).deleteButton
                );

                const { modal } = getDeleteVideoModal();
                expect(modal).toBeInTheDocument();
                expect(modal).toHaveTextContent(video.title);
            });
        });

        describe("upload date cell", () => {
            it("should render the cell correctly", async () => {
                createVideo({
                    profile: getOwnProfile(),
                    uploadDate: new Date(2024, 1, 25, 1, 1, 0),
                });
                createVideo({
                    profile: getOwnProfile(),
                    uploadDate: new Date(2024, 0, 24, 1, 1, 0),
                });
                const { waitForDataToLoad, getTable, getCells } =
                    renderComponent();
                await waitForDataToLoad();

                const { rows } = getTable();
                [/Feb 25, 2024/i, /Jan 24, 2024/i].forEach((date, index) => {
                    const uploadDateCell = getCells(rows[index])[1];
                    expect(uploadDateCell).toHaveTextContent(date);
                });
            });
        });

        describe("views cell", () => {
            it("should render the cell correctly", async () => {
                const videos = createVideos(3, { profile: getOwnProfile() });
                sortVideos(videos, "upload_date", "desc");
                const { waitForDataToLoad, getTable, getCells } =
                    renderComponent();
                await waitForDataToLoad();

                const { rows } = getTable();
                rows.forEach((row, index) => {
                    const viewsCell = getCells(row)[2];
                    expect(viewsCell).toHaveTextContent(
                        videos[index].view_count.toString()
                    );
                });
            });
        });

        describe("likes cell", () => {
            it("should render the cell correctly", async () => {
                const videos = createVideos(3, { profile: getOwnProfile() });
                sortVideos(videos, "upload_date", "desc");
                const { waitForDataToLoad, getTable, getCells } =
                    renderComponent();
                await waitForDataToLoad();

                const { rows } = getTable();
                rows.forEach((row, index) => {
                    const likesCell = getCells(row)[3];
                    expect(likesCell).toHaveTextContent(
                        videos[index].like_count.toString()
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
            expect(options.length).toBe(3);
            [/title/i, /description/i, /views/i].forEach((name, index) =>
                expect(options[index]).toHaveTextContent(name)
            );
        });

        it.each<{
            name: string;
            filter: Filter;
            arrange: () => Video[];
            filterVideos: (videos: Video[]) => Video[];
        }>([
            {
                name: "Title",
                filter: {
                    field: "title",
                    type: "char",
                    lookupType: "icontains",
                    value: "test 123",
                },
                arrange: () => [
                    ...createVideos(3, { profile: getOwnProfile() }),
                    ...createVideos(3, {
                        profile: getOwnProfile(),
                        title: "abc test 123",
                    }),
                ],
                filterVideos: (videos) =>
                    videos.filter((video) => video.title.includes("test 123")),
            },
            {
                name: "Description",
                filter: {
                    field: "description",
                    type: "char",
                    lookupType: "icontains",
                    value: "test 123",
                },
                arrange: () => [
                    ...createVideos(3, { profile: getOwnProfile() }),
                    ...createVideos(3, {
                        profile: getOwnProfile(),
                        description: "abc test 123",
                    }),
                ],
                filterVideos: (videos) =>
                    videos.filter((video) =>
                        video.description.includes("test 123")
                    ),
            },
            {
                name: "Views",
                filter: {
                    field: "view_count",
                    type: "number",
                    lookupType: "gte",
                    value: 100,
                },
                arrange: () => [
                    ...createVideos(2, {
                        profile: getOwnProfile(),
                        viewCount: 99,
                    }),
                    ...createVideos(2, {
                        profile: getOwnProfile(),
                        viewCount: 100,
                    }),
                    ...createVideos(2, {
                        profile: getOwnProfile(),
                        viewCount: 101,
                    }),
                ],
                filterVideos: (videos) =>
                    videos.filter((video) => video.view_count >= 100),
            },
        ])(
            "should filter videos when the $name filter is applied",
            async ({ name, filter, arrange, filterVideos }) => {
                const videos = arrange();
                sortVideos(videos, "upload_date", "desc");
                const { waitForDataToLoad, applyFilter, getTable } =
                    renderComponent();
                await waitForDataToLoad();
                let rows = getTable().rows;
                expect(rows.length).toBe(videos.length);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(videos[index].title)
                );

                await applyFilter(name, filter);

                const filteredVideos = filterVideos(videos);
                await waitFor(
                    () => {
                        rows = getTable().rows;
                        expect(rows.length).toBe(filteredVideos.length);
                        rows.forEach((row, index) =>
                            expect(row).toHaveTextContent(
                                filteredVideos[index].title
                            )
                        );
                    },
                    { timeout: 5000 }
                );
            }
        );

        it("should filter videos by title when the main filtering option is clicked", async () => {
            const text = "test 123";
            const videos = [
                ...createVideos(3, { profile: getOwnProfile() }),
                ...createVideos(3, {
                    profile: getOwnProfile(),
                    title: `abc ${text}`,
                }),
            ];
            sortVideos(videos, "upload_date", "desc");
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
                expect(row).toHaveTextContent(videos[index].title)
            );

            await user.type(getFilteringInput(), text);
            await user.click(getFilteringPopover().mainOption!);

            const filteredVideos = videos.filter((video) =>
                video.title.includes(text)
            );
            await waitFor(() => {
                rows = getTable().rows;
                expect(rows.length).toBe(3);
                rows.forEach((row, index) =>
                    expect(row).toHaveTextContent(filteredVideos[index].title)
                );
            });
        });
    });

    describe("ordering", () => {
        it("should order videos by title when the video column header is clicked", async () => {
            const videos = createVideos(5, { profile: getOwnProfile() });
            sortVideos(videos, "upload_date", "desc");
            const { waitForDataToLoad, getTable, clickHeader } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(5);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(videos[index].title)
            );

            await clickHeader(0);
            sortVideos(videos, "title", "asc");
            await waitFor(
                () => {
                    rows = getTable().rows;
                    expect(rows.length).toBe(5);
                    rows.forEach((row, index) =>
                        expect(row).toHaveTextContent(videos[index].title)
                    );
                },
                { timeout: 3000 }
            );

            await clickHeader(0);
            sortVideos(videos, "title", "desc");
            await waitFor(
                () => {
                    rows = getTable().rows;
                    expect(rows.length).toBe(5);
                    rows.forEach((row, index) =>
                        expect(row).toHaveTextContent(videos[index].title)
                    );
                },
                { timeout: 3000 }
            );
        });

        it("should order videos by upload date when the upload date column header is clicked", async () => {
            const videos = createVideos(5, { profile: getOwnProfile() });
            sortVideos(videos, "upload_date", "desc");
            const { waitForDataToLoad, getTable, clickHeader } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(5);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(videos[index].title)
            );

            await clickHeader(1);
            sortVideos(videos, "upload_date", "asc");
            await waitFor(
                () => {
                    rows = getTable().rows;
                    expect(rows.length).toBe(5);
                    rows.forEach((row, index) =>
                        expect(row).toHaveTextContent(videos[index].title)
                    );
                },
                { timeout: 3000 }
            );

            await clickHeader(1);
            sortVideos(videos, "upload_date", "desc");
            await waitFor(
                () => {
                    rows = getTable().rows;
                    expect(rows.length).toBe(5);
                    rows.forEach((row, index) =>
                        expect(row).toHaveTextContent(videos[index].title)
                    );
                },
                { timeout: 3000 }
            );
        });

        it("should order videos by view count when the views column header is clicked", async () => {
            const videos = createVideos(5, { profile: getOwnProfile() });
            sortVideos(videos, "upload_date", "desc");
            const { waitForDataToLoad, getTable, clickHeader } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(5);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(videos[index].title)
            );

            await clickHeader(2);
            sortVideos(videos, "view_count", "desc");
            await waitFor(
                () => {
                    rows = getTable().rows;
                    expect(rows.length).toBe(5);
                    rows.forEach((row, index) =>
                        expect(row).toHaveTextContent(videos[index].title)
                    );
                },
                { timeout: 3000 }
            );

            await clickHeader(2);
            sortVideos(videos, "view_count", "asc");
            await waitFor(
                () => {
                    rows = getTable().rows;
                    expect(rows.length).toBe(5);
                    rows.forEach((row, index) =>
                        expect(row).toHaveTextContent(videos[index].title)
                    );
                },
                { timeout: 3000 }
            );
        });

        it("should order videos by like count when the likes column header is clicked", async () => {
            const videos = createVideos(5, { profile: getOwnProfile() });
            sortVideos(videos, "upload_date", "desc");
            const { waitForDataToLoad, getTable, clickHeader } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(5);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(videos[index].title)
            );

            await clickHeader(3);
            sortVideos(videos, "like_count", "desc");
            await waitFor(
                () => {
                    rows = getTable().rows;
                    expect(rows.length).toBe(5);
                    rows.forEach((row, index) =>
                        expect(row).toHaveTextContent(videos[index].title)
                    );
                },
                { timeout: 3000 }
            );

            await clickHeader(3);
            sortVideos(videos, "like_count", "asc");
            await waitFor(
                () => {
                    rows = getTable().rows;
                    expect(rows.length).toBe(5);
                    rows.forEach((row, index) =>
                        expect(row).toHaveTextContent(videos[index].title)
                    );
                },
                { timeout: 3000 }
            );
        });
    });

    describe("pagination", () => {
        it("should show next page when the next button is clicked", async () => {
            const videos = createVideos(DEFAULT_PAGE_SIZE * 3, {
                profile: getOwnProfile(),
            });
            sortVideos(videos, "upload_date", "desc");
            const { waitForDataToLoad, getTable, nextPage } = renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            let page = videos.slice(0, DEFAULT_PAGE_SIZE);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].title)
            );

            await nextPage();
            rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            page = videos.slice(DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE * 2);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].title)
            );

            await nextPage();
            rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            page = videos.slice(DEFAULT_PAGE_SIZE * 2, DEFAULT_PAGE_SIZE * 3);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].title)
            );
        });

        it("should show previous page when the previous button is clicked", async () => {
            const videos = createVideos(DEFAULT_PAGE_SIZE * 2, {
                profile: getOwnProfile(),
            });
            sortVideos(videos, "upload_date", "desc");
            const { waitForDataToLoad, getTable, nextPage, previousPage } =
                renderComponent();
            await waitForDataToLoad();
            await nextPage();
            let rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            let page = videos.slice(DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE * 2);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].title)
            );

            await previousPage();

            rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            page = videos.slice(0, DEFAULT_PAGE_SIZE);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(page[index].title)
            );
        });

        it("should change page size when page size is selected", async () => {
            const videos = createVideos(50, { profile: getOwnProfile() });
            sortVideos(videos, "upload_date", "desc");
            const { waitForDataToLoad, getTable, changePageSize } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(DEFAULT_PAGE_SIZE);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(videos[index].title)
            );

            await changePageSize(30);

            rows = getTable().rows;
            expect(rows.length).toBe(30);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(videos[index].title)
            );
        });
    });

    describe("editing video", () => {
        it("should refresh table after video is edited", async () => {
            const video = createVideo({ profile: getOwnProfile() });
            const newTitle = "test 123";
            const { waitForDataToLoad, getTable, editVideo } =
                renderComponent();
            await waitForDataToLoad();
            let row = getTable().rows[0];
            expect(row).toHaveTextContent(video.title);

            await editVideo(row, newTitle);

            row = getTable().rows[0];
            expect(row).toHaveTextContent(newTitle);
        });
    });

    describe("deleting video", () => {
        it("should refresh table after video is deleted", async () => {
            const videos = createVideos(3, { profile: getOwnProfile() });
            sortVideos(videos, "upload_date", "desc");
            const { waitForDataToLoad, getTable, deleteVideo } =
                renderComponent();
            await waitForDataToLoad();
            let rows = getTable().rows;
            expect(rows.length).toBe(3);
            rows.forEach((row, index) =>
                expect(row).toHaveTextContent(videos[index].title)
            );

            await deleteVideo(rows[1]);

            rows = getTable().rows;
            expect(rows.length).toBe(2);
            expect(rows[0]).toHaveTextContent(videos[0].title);
            expect(rows[1]).toHaveTextContent(videos[2].title);
        });
    });
});

function renderComponent(useAppRoutes?: boolean) {
    const { getLocation } = renderWithRouter(<VideoTable />, useAppRoutes);

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

    const getVideoCellComponents = (cell: HTMLElement) => {
        return {
            thumbnail: within(cell).getByRole("img", { name: /thumbnail/i }),
            title: within(cell).getByLabelText(/title/i),
            description: within(cell).getByLabelText(/description/i),
            editButton: within(cell).getByRole("button", { name: /edit/i }),
            viewButton: within(cell).getByRole("button", { name: /view/i }),
            deleteButton: within(cell).getByRole("button", { name: /delete/i }),
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

    const getDeleteVideoModal = () => {
        const modal = screen.queryByRole("alertdialog", {
            name: /delete this video/i,
        });
        return {
            modal,
            deleteButton:
                modal && within(modal).getByRole("button", { name: /delete/i }),
        };
    };

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
        waitFor(() => expect(getSpinner()).not.toBeInTheDocument(), {
            timeout: 5000,
        });

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
        await user.click(getVideoCellComponents(videoCell).editButton);
        const { titleInput, saveButton } = getEditVideoModal();
        await user.clear(titleInput!);
        await user.type(titleInput!, title);
        await user.click(saveButton!);
    };

    const deleteVideo = async (row: HTMLElement) => {
        const videoCell = getCells(row)[0];
        await user.click(getVideoCellComponents(videoCell).deleteButton);
        await user.click(getDeleteVideoModal().deleteButton!);
    };

    return {
        getLocation,
        getSpinner,
        getFilteringInput,
        getFilteringPopover,
        getTable,
        getCells,
        getVideoCellComponents,
        getEditVideoModal,
        getDeleteVideoModal,
        user,
        waitForDataToLoad,
        triggerFilteringPopover,
        applyFilter,
        clickHeader,
        nextPage,
        previousPage,
        changePageSize,
        editVideo,
        deleteVideo,
    };
}
