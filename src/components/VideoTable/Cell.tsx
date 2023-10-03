import { Td } from "@chakra-ui/react";
import { Cell as ReactTableCell, flexRender } from "@tanstack/react-table";
import { memo } from "react";
import Video from "../../entities/Video";
import { NUMERIC_COLUMNS } from "./constants";

interface Props {
    cell: ReactTableCell<Video, any>;
}

const Cell = memo(
    ({ cell }: Props) => {
        return (
            <Td isNumeric={NUMERIC_COLUMNS.includes(cell.column.id)}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Td>
        );
    },
    (prevProps, nextProps) =>
        prevProps.cell.row.original === nextProps.cell.row.original
);

export default Cell;
