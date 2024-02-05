import {
    Table as ChakraTable,
    TableContainer,
    Tbody,
    Th,
    Thead,
    Tr,
    VStack,
} from "@chakra-ui/react";
import {
    ColumnSort,
    SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { Filter, Ordering, Pagination } from "../../services/BaseQuery";
import { MAIN_CONTENT_AREA_PADDING } from "../../styleConstants";
import { insertIf } from "../../utils";
import LimitOffsetPagination from "../LimitOffsetPagination";
import Cell from "./Cell";
import Filtering, { FilteringOption } from "./Filtering";
import Header from "./Header";

export interface ColumnDef<T> {
    field: string;
    header: string;
    cell: (item: T) => JSX.Element | string;
    enableOrdering: boolean;
}

interface Props<T> {
    columnDefs: ColumnDef<T>[];
    numericFields?: string[];
    filteringOptions: FilteringOption[];
    mainFilteringField: string;
    onFilteringChange: (appliedFilters: Filter[]) => void;
    defaultOrdering?: Ordering;
    onOrderingChange: (ordering?: Ordering) => void;
    defaultPageSize: 10 | 30 | 50;
    onPaginationChange: (pagination: Pagination) => void;
    data: T[];
    totalItems: number;
}

function Table<T>({
    columnDefs,
    numericFields,
    filteringOptions,
    mainFilteringField,
    onFilteringChange,
    defaultOrdering,
    onOrderingChange,
    defaultPageSize,
    onPaginationChange,
    data,
    totalItems,
}: Props<T>) {
    const [sorting, setSorting] = useState<SortingState>([
        ...insertIf<ColumnSort>(!!defaultOrdering, {
            id: defaultOrdering!.field,
            desc: defaultOrdering!.direction === "DESC",
        }),
    ]);

    useEffect(() => {
        if (sorting.length > 0)
            onOrderingChange({
                field: sorting[0].id,
                direction: sorting[0].desc ? "DESC" : "ASC",
            });
        else onOrderingChange(undefined);
    }, [sorting]);

    const [highlightedRowId, setHighlightedRowId] = useState<string | null>(
        null
    );

    const table = useReactTable<T>({
        data,
        state: { sorting },
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        enableSortingRemoval: false,
        manualSorting: true,
        columns: columnDefs.map((columnDef) => ({
            accessorKey: columnDef.field,
            header: (header) => (
                <Header header={header}>{columnDef.header}</Header>
            ),
            cell: ({ row: { original } }) => columnDef.cell(original),
            enableSorting: columnDef.enableOrdering,
        })),
    });

    return (
        <VStack
            width="100%"
            maxWidth={`calc(100vw - ${MAIN_CONTENT_AREA_PADDING} * 2)`}
            spacing={4}
        >
            <Filtering
                options={filteringOptions}
                mainField={mainFilteringField}
                onChange={onFilteringChange}
            />
            <TableContainer width="100%" overflowX="auto">
                <ChakraTable variant="simple" size="sm">
                    <Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Th
                                        key={header.id}
                                        isNumeric={numericFields?.includes(
                                            header.column.id
                                        )}
                                        paddingY={1}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </Thead>
                    <Tbody fontSize="xs">
                        {table.getRowModel().rows.map((row) => (
                            <Tr
                                key={row.id}
                                onClick={() => setHighlightedRowId(row.id)}
                                onMouseOver={() => setHighlightedRowId(row.id)}
                                className={classNames({
                                    "is-highlighted":
                                        row.id === highlightedRowId,
                                })}
                            >
                                {row.getVisibleCells().map((cell: any) => (
                                    <Cell
                                        key={cell.id}
                                        cell={cell}
                                        isNumeric={numericFields?.includes(
                                            cell.column.id
                                        )}
                                    />
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </ChakraTable>
            </TableContainer>
            <LimitOffsetPagination
                defaultPageSize={defaultPageSize}
                totalItems={totalItems}
                onChange={(limit, offset) =>
                    onPaginationChange({ type: "limit_offset", limit, offset })
                }
            />
        </VStack>
    );
}

export default Table;
