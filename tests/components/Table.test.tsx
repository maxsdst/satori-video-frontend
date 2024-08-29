import { faker } from "@faker-js/faker";
import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Table, { ColumnDef, FilteringOption } from "../../src/components/Table";
import { Filter, Ordering, Pagination } from "../../src/services/BaseQuery";
import { renderWithRouter } from "../utils";

interface Item {
    name: string;
    price: number;
    isAvailable: boolean;
}

const columnDefs: ColumnDef<Item>[] = [
    {
        field: "name",
        header: "Name",
        cell: (item) => item.name,
        enableOrdering: false,
    },
    {
        field: "price",
        header: "Price",
        cell: (item) => item.price.toString(),
        enableOrdering: true,
    },
    {
        field: "isAvailable",
        header: "Available",
        cell: (item) => (item.isAvailable ? "Yes" : "No"),
        enableOrdering: false,
    },
];

const filteringOptions: FilteringOption[] = [
    {
        field: "name",
        name: "Name",
        type: "char",
    },
    {
        field: "price",
        name: "Price",
        type: "number",
    },
    {
        field: "isAvailable",
        name: "Available",
        type: "boolean",
    },
];

describe("Table", () => {
    describe("filtering input", () => {
        describe("initial state", () => {
            it("should throw an error if the main filtering option is not of type 'char'", () => {
                expect(() =>
                    renderComponent({ mainFilteringField: "price" })
                ).toThrow(/main filtering field/i);
            });
        });

        describe("input", () => {
            it("should render the input", () => {
                const { filteringInput } = renderComponent({});

                expect(filteringInput).toBeInTheDocument();
            });

            it("should show the popover when the input is clicked", async () => {
                const { filteringInput, getFilteringPopover, user } =
                    renderComponent({});
                expect(getFilteringPopover().popover).not.toBeInTheDocument();

                await user.click(filteringInput);

                expect(getFilteringPopover().popover).toBeInTheDocument();
            });

            it("should show the popover when typing in input", async () => {
                const { filteringInput, getFilteringPopover, user } =
                    renderComponent({});
                expect(getFilteringPopover().popover).not.toBeInTheDocument();

                await user.type(filteringInput, "a");

                expect(getFilteringPopover().popover).toBeInTheDocument();
            });
        });

        describe("popover", () => {
            it("should render filtering options", async () => {
                const { triggerFilteringPopover, getFilteringPopover } =
                    renderComponent({});
                await triggerFilteringPopover();

                const { options } = getFilteringPopover();
                expect(options.length).toBe(filteringOptions.length);
                options.forEach((option, index) =>
                    expect(option).toHaveTextContent(
                        filteringOptions[index].name
                    )
                );
            });

            it("should filter options as user types in input", async () => {
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    filteringInput,
                    user,
                } = renderComponent({});
                await triggerFilteringPopover();
                expect(getFilteringPopover().options.length).toBe(
                    filteringOptions.length
                );

                await user.type(filteringInput, "avail");

                const { options, nameOption, priceOption, availableOption } =
                    getFilteringPopover();
                expect(options.length).toBe(2);
                expect(nameOption).not.toBeInTheDocument();
                expect(priceOption).not.toBeInTheDocument();
                expect(availableOption).toBeInTheDocument();
            });

            it("should render the main field option if the input is not empty", async () => {
                const { getFilteringPopover, filteringInput, user } =
                    renderComponent({ mainFilteringField: "name" });
                const text = "test 123";
                await user.type(filteringInput, text);

                const { mainOption } = getFilteringPopover();
                expect(mainOption).toBeInTheDocument();
                expect(mainOption).toHaveTextContent(`Name contains "${text}"`);
            });

            it("should not render the main field option if the input is empty", async () => {
                const { triggerFilteringPopover, getFilteringPopover } =
                    renderComponent({ mainFilteringField: "name" });
                await triggerFilteringPopover();

                const { mainOption } = getFilteringPopover();
                expect(mainOption).not.toBeInTheDocument();
            });

            it("should apply filter when the main field option is clicked", async () => {
                const text = "test 123";
                const filter: Filter = {
                    field: "name",
                    type: "char",
                    lookupType: "icontains",
                    value: text,
                };
                const {
                    getFilteringPopover,
                    filteringInput,
                    user,
                    isFilterApplied,
                } = renderComponent({ mainFilteringField: "name" });
                await user.type(filteringInput, text);
                expect(isFilterApplied(filter)).toBe(false);

                await user.click(getFilteringPopover().mainOption!);

                expect(isFilterApplied(filter)).toBe(true);
            });

            it("should not render option if a filter is already applied to the field", async () => {
                const filter: Filter = {
                    field: "isAvailable",
                    type: "boolean",
                    lookupType: "exact",
                    value: true,
                };
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    applyFilter,
                } = renderComponent({});
                await applyFilter("Available", filter);

                await triggerFilteringPopover();
                expect(
                    getFilteringPopover().availableOption
                ).not.toBeInTheDocument();
            });

            it("should not render the main field option if a filter is already applied to the field", async () => {
                const filter: Filter = {
                    field: "name",
                    type: "char",
                    lookupType: "icontains",
                    value: "test 123",
                };
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    applyFilter,
                } = renderComponent({ mainFilteringField: "name" });
                await applyFilter("Name", filter);

                await triggerFilteringPopover();
                expect(
                    getFilteringPopover().mainOption
                ).not.toBeInTheDocument();
            });

            it("should open filter modal when an option is clicked", async () => {
                const modalName = "Price";
                const { triggerFilteringPopover, getFilteringPopover, user } =
                    renderComponent({});
                await triggerFilteringPopover();
                expect(
                    screen.queryByRole("dialog", { name: modalName })
                ).not.toBeInTheDocument();

                await user.click(getFilteringPopover().priceOption!);

                expect(
                    screen.queryByRole("dialog", { name: modalName })
                ).toBeInTheDocument();
            });
        });

        describe("char filter modal", () => {
            const modalName = "Name";

            it("should render the modal correctly", async () => {
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getCharFilterModal,
                    user,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().nameOption!);

                const { valueInput, applyButton } =
                    getCharFilterModal(modalName);
                expect(valueInput).toBeInTheDocument();
                expect(applyButton).toBeInTheDocument();
            });

            it("should apply filter when the apply button is clicked if the value input is not empty", async () => {
                const value = "test 123";
                const filter: Filter = {
                    field: "name",
                    type: "char",
                    lookupType: "icontains",
                    value,
                };
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getCharFilterModal,
                    user,
                    isFilterApplied,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().nameOption!);
                const { valueInput, applyButton } =
                    getCharFilterModal(modalName);
                await user.type(valueInput!, value);
                expect(isFilterApplied(filter)).toBe(false);

                await user.click(applyButton!);

                expect(isFilterApplied(filter)).toBe(true);
            });

            it("should show error message when the apply button is clicked if the value input is empty", async () => {
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getCharFilterModal,
                    user,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().nameOption!);

                const { applyButton } = getCharFilterModal(modalName);
                await user.click(applyButton!);

                const { error } = getCharFilterModal(modalName);
                expect(error).toBeInTheDocument();
                expect(error).toHaveTextContent(/value is required/i);
            });

            it("should close the modal if filter applied successfully", async () => {
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getCharFilterModal,
                    user,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().nameOption!);
                const { valueInput, applyButton } =
                    getCharFilterModal(modalName);

                await user.type(valueInput!, "a");
                await user.click(applyButton!);

                expect(
                    getCharFilterModal(modalName).modal
                ).not.toBeInTheDocument();
            });
        });

        describe("number filter modal", () => {
            const modalName = "Price";

            it("should render the modal correctly", async () => {
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getNumberFilterModal,
                    user,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().priceOption!);

                const { lookupTypeSelect, getOption, valueInput, applyButton } =
                    getNumberFilterModal(modalName);
                expect(lookupTypeSelect).toBeInTheDocument();
                expect(getOption("gte")).toBeInTheDocument();
                expect(getOption("lte")).toBeInTheDocument();
                expect(valueInput).toBeInTheDocument();
                expect(applyButton).toBeInTheDocument();
            });

            it("should apply filter when the apply button is clicked", async () => {
                const value = 123;
                const filter: Filter = {
                    field: "price",
                    type: "number",
                    lookupType: "gte",
                    value,
                };
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getNumberFilterModal,
                    user,
                    isFilterApplied,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().priceOption!);
                const { valueInput, applyButton } =
                    getNumberFilterModal(modalName);
                await user.type(valueInput!, value.toString());
                expect(isFilterApplied(filter)).toBe(false);

                await user.click(applyButton!);

                expect(isFilterApplied(filter)).toBe(true);
            });

            it.each<{ lookupType: "gte" | "lte"; optionName: string }>([
                { lookupType: "gte", optionName: ">=" },
                { lookupType: "lte", optionName: "<=" },
            ])(
                "should apply filter with lookupType $lookupType if $optionName option is selected",
                async ({ lookupType }) => {
                    const value = 123;
                    const filter: Filter = {
                        field: "price",
                        type: "number",
                        lookupType,
                        value,
                    };
                    const {
                        triggerFilteringPopover,
                        getFilteringPopover,
                        getNumberFilterModal,
                        user,
                        isFilterApplied,
                    } = renderComponent({});
                    await triggerFilteringPopover();
                    await user.click(getFilteringPopover().priceOption!);

                    const {
                        lookupTypeSelect,
                        getOption,
                        valueInput,
                        applyButton,
                    } = getNumberFilterModal(modalName);
                    await user.selectOptions(
                        lookupTypeSelect!,
                        getOption(lookupType)
                    );
                    await user.type(valueInput!, value.toString());
                    await user.click(applyButton!);

                    expect(isFilterApplied(filter)).toBe(true);
                }
            );

            it("should apply filter with value 0 if the value input is empty", async () => {
                const filter: Filter = {
                    field: "price",
                    type: "number",
                    lookupType: "gte",
                    value: 0,
                };
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getNumberFilterModal,
                    user,
                    isFilterApplied,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().priceOption!);

                const { valueInput, applyButton } =
                    getNumberFilterModal(modalName);
                await user.clear(valueInput!);
                await user.click(applyButton!);

                expect(isFilterApplied(filter)).toBe(true);
            });

            it("should close the modal if filter applied successfully", async () => {
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getNumberFilterModal,
                    user,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().nameOption!);
                const { applyButton } = getNumberFilterModal(modalName);

                await user.click(applyButton!);

                expect(
                    getNumberFilterModal(modalName).modal
                ).not.toBeInTheDocument();
            });
        });

        describe("boolean filter modal", () => {
            const modalName = "Available";

            it("should render the modal correctly", async () => {
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getBooleanFilterModal,
                    user,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().availableOption!);

                const { yesOption, noOption, applyButton } =
                    getBooleanFilterModal(modalName);
                expect(yesOption).toBeInTheDocument();
                expect(noOption).toBeInTheDocument();
                expect(applyButton).toBeInTheDocument();
            });

            it("should apply filter when the apply button is clicked", async () => {
                const filter: Filter = {
                    field: "isAvailable",
                    type: "boolean",
                    lookupType: "exact",
                    value: true,
                };
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getBooleanFilterModal,
                    user,
                    isFilterApplied,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().availableOption!);
                const { applyButton } = getBooleanFilterModal(modalName);
                expect(isFilterApplied(filter)).toBe(false);

                await user.click(applyButton!);

                expect(isFilterApplied(filter)).toBe(true);
            });

            it.each<{ value: boolean; optionName: string }>([
                { value: true, optionName: "Yes" },
                { value: false, optionName: "No" },
            ])(
                "should apply filter with value $value if $optionName option is selected",
                async ({ value }) => {
                    const filter: Filter = {
                        field: "isAvailable",
                        type: "boolean",
                        lookupType: "exact",
                        value,
                    };
                    const {
                        triggerFilteringPopover,
                        getFilteringPopover,
                        getBooleanFilterModal,
                        user,
                        isFilterApplied,
                    } = renderComponent({});
                    await triggerFilteringPopover();
                    await user.click(getFilteringPopover().availableOption!);

                    const { yesOption, noOption, applyButton } =
                        getBooleanFilterModal(modalName);
                    await user.click(value ? yesOption! : noOption!);
                    await user.click(applyButton!);

                    expect(isFilterApplied(filter)).toBe(true);
                }
            );

            it("should close the modal if filter applied successfully", async () => {
                const {
                    triggerFilteringPopover,
                    getFilteringPopover,
                    getBooleanFilterModal,
                    user,
                } = renderComponent({});
                await triggerFilteringPopover();
                await user.click(getFilteringPopover().availableOption!);
                const { applyButton } = getBooleanFilterModal(modalName);

                await user.click(applyButton!);

                expect(
                    getBooleanFilterModal(modalName).modal
                ).not.toBeInTheDocument();
            });
        });

        describe("applied filters list", () => {
            it("should render applied filters", async () => {
                const filter1: Filter = {
                    field: "price",
                    type: "number",
                    lookupType: "gte",
                    value: 123,
                };
                const filter2: Filter = {
                    field: "name",
                    type: "char",
                    lookupType: "icontains",
                    value: "test 123",
                };
                const { applyFilter, getAppliedFilterItems } = renderComponent(
                    {}
                );
                await applyFilter("Price", filter1);
                await applyFilter("Name", filter2);

                const items = getAppliedFilterItems();
                expect(items.length).toBe(2);
                expect(items[0]).toHaveTextContent("Price");
                expect(items[1]).toHaveTextContent("Name");
            });

            it("should render correct text for filter with type 'char' and lookupType 'icontains'", async () => {
                const optionName = "Name";
                const filter: Filter = {
                    field: "name",
                    type: "char",
                    lookupType: "icontains",
                    value: "test 123",
                };
                const { applyFilter, getAppliedFilterItems } = renderComponent(
                    {}
                );
                await applyFilter(optionName, filter);

                const item = getAppliedFilterItems()[0];
                expect(item).toHaveTextContent(
                    `${optionName} contains "${filter.value}"`
                );
            });

            it.each<{
                lookupType: "gte" | "lte";
                getText: (optionName: string, value: number) => string;
            }>([
                {
                    lookupType: "gte",
                    getText: (optionName, value) => `${optionName} >= ${value}`,
                },
                {
                    lookupType: "lte",
                    getText: (optionName, value) => `${optionName} <= ${value}`,
                },
            ])(
                "should render correct text for filter with type 'number' and lookupType $lookupType",
                async ({ lookupType, getText }) => {
                    const optionName = "Price";
                    const filter: Filter = {
                        field: "price",
                        type: "number",
                        lookupType,
                        value: 123,
                    };
                    const { applyFilter, getAppliedFilterItems } =
                        renderComponent({});
                    await applyFilter(optionName, filter);

                    const item = getAppliedFilterItems()[0];
                    expect(item).toHaveTextContent(
                        getText(optionName, filter.value)
                    );
                }
            );

            it.each<{
                value: boolean;
                getText: (optionName: string) => string;
            }>([
                {
                    value: true,
                    getText: (optionName) => `${optionName}: Yes`,
                },
                {
                    value: false,
                    getText: (optionName) => `${optionName}: No`,
                },
            ])(
                "should render correct text for filter with type 'boolean' and value $value",
                async ({ value, getText }) => {
                    const optionName = "Available";
                    const filter: Filter = {
                        field: "isAvailable",
                        type: "boolean",
                        lookupType: "exact",
                        value,
                    };
                    const { applyFilter, getAppliedFilterItems } =
                        renderComponent({});
                    await applyFilter(optionName, filter);

                    const item = getAppliedFilterItems()[0];
                    expect(item).toHaveTextContent(getText(optionName));
                }
            );

            it("should remove filter when the remove button is clicked", async () => {
                const filter1: Filter = {
                    field: "price",
                    type: "number",
                    lookupType: "gte",
                    value: 123,
                };
                const filter2: Filter = {
                    field: "name",
                    type: "char",
                    lookupType: "icontains",
                    value: "test 123",
                };
                const {
                    applyFilter,
                    getAppliedFilterItems,
                    isFilterApplied,
                    user,
                } = renderComponent({});
                await applyFilter("Price", filter1);
                await applyFilter("Name", filter2);
                const items = getAppliedFilterItems();
                expect(items.length).toBe(2);
                expect(isFilterApplied(filter1)).toBe(true);
                expect(isFilterApplied(filter2)).toBe(true);

                const removeButton = within(items[1]).getByRole("button", {
                    name: /remove/i,
                });
                await user.click(removeButton);

                expect(getAppliedFilterItems().length).toBe(1);
                expect(isFilterApplied(filter1)).toBe(true);
                expect(isFilterApplied(filter2)).toBe(false);
            });
        });
    });

    describe("table", () => {
        describe("headers", () => {
            it("should render headers correctly", () => {
                const { getTable } = renderComponent({});

                const { headers } = getTable();
                expect(headers.length).toBe(columnDefs.length);
                headers.forEach((header, index) =>
                    expect(header).toHaveTextContent(columnDefs[index].header)
                );
            });

            it("should change ordering when a header is clicked if column's enableOrdering is set to true", async () => {
                const { getTable, getOrdering, user } = renderComponent({});
                expect(getOrdering()).toBe(undefined);

                let priceHeader = getTable().headers[1];
                let priceHeaderButton = within(priceHeader).getByRole("button");
                await user.click(priceHeaderButton);
                expect(getOrdering()).toEqual<Ordering>({
                    field: "price",
                    direction: "DESC",
                });

                priceHeader = getTable().headers[1];
                priceHeaderButton = within(priceHeader).getByRole("button");
                await user.click(priceHeaderButton);
                expect(getOrdering()).toEqual<Ordering>({
                    field: "price",
                    direction: "ASC",
                });
            });

            it("should not change ordering when a header is clicked if column's enableOrdering is set to false", async () => {
                const { getTable, getOrdering, user } = renderComponent({});
                expect(getOrdering()).toBe(undefined);

                const nameHeader = getTable().headers[0];
                const nameHeaderButton = within(nameHeader).getByRole("button");
                await user.click(nameHeaderButton);
                expect(getOrdering()).toBe(undefined);
            });
        });

        describe("rows", () => {
            it("should render rows correctly", () => {
                const items = createItems(10);
                const { getTable, getCells } = renderComponent({
                    data: [],
                    totalItems: 10,
                });

                const { rows } = getTable();
                rows.forEach((row, rowIndex) => {
                    const cells = getCells(row);
                    cells.forEach((cell, cellIndex) => {
                        expect(cell).toHaveTextContent(
                            columnDefs[cellIndex].cell(
                                items[rowIndex]
                            ) as string
                        );
                    });
                });
            });
        });
    });

    describe("paginator", () => {
        it("should render the paginator correctly", () => {
            const items = createItems(1);
            const { getPaginator } = renderComponent({
                data: items,
                totalItems: 1,
            });

            const { previousButton, nextButton, pageSizeMenuButton } =
                getPaginator();
            expect(previousButton).toBeInTheDocument();
            expect(nextButton).toBeInTheDocument();
            expect(pageSizeMenuButton).toBeInTheDocument();
        });

        it("should set the page size to defaultPageSize initially", () => {
            const defaultPageSize = 30;
            const items = createItems(1);
            const { getPaginator } = renderComponent({
                data: items,
                totalItems: 1,
                defaultPageSize,
            });

            expect(getPaginator().pageSizeMenuButton).toHaveTextContent(
                defaultPageSize.toString()
            );
        });

        it("should change pagination when the next/previous button is clicked", async () => {
            const pageSize = 10;
            const items = createItems(1);
            const { getPaginator, getPagination, user } = renderComponent({
                data: items,
                totalItems: 100,
                defaultPageSize: pageSize,
            });
            const { previousButton, nextButton } = getPaginator();
            expect(getPagination()).toEqual<Pagination>({
                type: "limit_offset",
                limit: 10,
                offset: 0,
            });

            await user.click(nextButton);
            expect(getPagination()).toEqual<Pagination>({
                type: "limit_offset",
                limit: pageSize,
                offset: pageSize,
            });

            await user.click(nextButton);
            expect(getPagination()).toEqual<Pagination>({
                type: "limit_offset",
                limit: pageSize,
                offset: pageSize * 2,
            });

            await user.click(previousButton);
            expect(getPagination()).toEqual<Pagination>({
                type: "limit_offset",
                limit: pageSize,
                offset: pageSize * 1,
            });
        });

        it("should change pagination when page size is selected", async () => {
            const pageSize = 10;
            const items = createItems(1);
            const { getPaginator, getPagination, user } = renderComponent({
                data: items,
                totalItems: 100,
                defaultPageSize: pageSize,
            });
            const { pageSizeMenuButton } = getPaginator();
            expect(getPagination()).toEqual<Pagination>({
                type: "limit_offset",
                limit: 10,
                offset: 0,
            });

            await user.click(pageSizeMenuButton);
            const menu = screen.getByRole("menu");
            const menuItem = within(menu).getByRole("menuitemradio", {
                name: /30/i,
            });
            await user.click(menuItem);

            expect(getPagination()).toEqual<Pagination>({
                type: "limit_offset",
                limit: 30,
                offset: 0,
            });
        });
    });
});

type DefaultPageSize = 10 | 30 | 50;

interface Props<T> {
    mainFilteringField?: string;
    defaultOrdering?: Ordering;
    defaultPageSize?: DefaultPageSize;
    data?: T[];
    totalItems?: number;
}

function renderComponent(props: Props<Item>, useAppRoutes?: boolean) {
    const defaults = {
        mainFilteringField: "name",
        defaultPageSize: 10 as DefaultPageSize,
        data: [],
        totalItems: 0,
    };

    const onFilteringChange = vi.fn();
    const onOrderingChange = vi.fn();
    const onPaginationChange = vi.fn();

    const { getLocation } = renderWithRouter(
        <Table
            columnDefs={columnDefs}
            filteringOptions={filteringOptions}
            onFilteringChange={onFilteringChange}
            onOrderingChange={onOrderingChange}
            onPaginationChange={onPaginationChange}
            {...{ ...defaults, ...props }}
        />,
        useAppRoutes
    );

    const filteringInput = screen.getByPlaceholderText(/filter/i);

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
            nameOption:
                popover &&
                within(popover).queryByRole("listitem", { name: "Name" }),
            priceOption:
                popover &&
                within(popover).queryByRole("listitem", { name: "Price" }),
            availableOption:
                popover &&
                within(popover).queryByRole("listitem", { name: "Available" }),
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

    const getAppliedFilterItems = () => {
        const list = screen.getByRole("list", { name: /applied filters/i });
        return within(list).queryAllByRole("listitem");
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

    const getOrdering = () => {
        const lastCall = onOrderingChange.mock.lastCall as
            | [Ordering]
            | undefined;
        return lastCall ? lastCall[0] : undefined;
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

    const getPagination = () => {
        const lastCall = onPaginationChange.mock.lastCall as
            | [Pagination]
            | undefined;
        return lastCall ? lastCall[0] : undefined;
    };

    const user = userEvent.setup();

    const triggerFilteringPopover = () => user.click(filteringInput);

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

    const isFilterApplied = (filter: Filter) => {
        const lastCall = onFilteringChange.mock.lastCall as
            | [Filter[]]
            | undefined;
        if (lastCall === undefined) return false;

        const filters = lastCall[0];
        return filters.some((appliedFilter) =>
            areFiltersEqual(appliedFilter, filter)
        );
    };

    return {
        getLocation,
        filteringInput,
        getFilteringPopover,
        getCharFilterModal,
        getNumberFilterModal,
        getBooleanFilterModal,
        getAppliedFilterItems,
        getTable,
        getCells,
        getOrdering,
        getPaginator,
        getPagination,
        user,
        triggerFilteringPopover,
        applyFilter,
        isFilterApplied,
    };
}

function createItems(quantity: number): Item[] {
    const items: Item[] = [];

    for (let i = 0; i < quantity; i++) {
        items.push({
            name: faker.commerce.productName(),
            price: faker.number.int(100),
            isAvailable: faker.datatype.boolean(),
        });
    }

    return items;
}

function areFiltersEqual(filter1: Filter, filter2: Filter): boolean {
    return (
        filter1.field === filter2.field &&
        filter1.type === filter2.type &&
        filter1.lookupType === filter2.lookupType &&
        filter1.value === filter2.value
    );
}
