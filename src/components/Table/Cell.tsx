import { Td } from "@chakra-ui/react";
import { Cell as ReactTableCell, flexRender } from "@tanstack/react-table";
import { memo } from "react";

interface Props<T> {
    cell: ReactTableCell<T, any>;
    isNumeric?: boolean;
}

function Cell<T>({ cell, isNumeric }: Props<T>) {
    return (
        <Td isNumeric={isNumeric}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </Td>
    );
}

export default memo(
    Cell,
    (prevProps, nextProps) =>
        prevProps.cell.row.original === nextProps.cell.row.original
);
