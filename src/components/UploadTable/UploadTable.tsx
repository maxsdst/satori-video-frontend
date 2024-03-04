import { Icon, Spinner } from "@chakra-ui/react";
import { Ref, forwardRef, useImperativeHandle, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import Upload from "../../entities/Upload";
import useUploads, { UploadQuery } from "../../hooks/uploads/useUploads";
import { Ordering } from "../../services/BaseQuery";
import { convertDateToString } from "../../utils";
import Table, { ColumnDef, FilteringOption } from "../Table";
import FileCell from "./FileCell";

export interface UploadTableHandle {
    refetchUploads: () => void;
}

const UploadTable = forwardRef(({}, ref: Ref<UploadTableHandle>) => {
    const defaultPageSize = 10;

    const defaultOrdering: Ordering = {
        field: "creation_date",
        direction: "DESC",
    };

    const [uploadQuery, setUploadQuery] = useState<UploadQuery>({
        ordering: defaultOrdering,
        pagination: { type: "limit_offset", limit: defaultPageSize, offset: 0 },
    });

    const {
        data: uploads,
        isLoading,
        error,
        refetch,
    } = useUploads(uploadQuery, {
        keepPreviousData: true,
    });

    useImperativeHandle(ref, () => ({ refetchUploads: refetch }));

    if (isLoading) return <Spinner />;
    if (error) throw error;

    const columnDefs: ColumnDef<Upload>[] = [
        {
            field: "filename",
            header: "File",
            cell: (upload) => (
                <FileCell upload={upload} onVideoMutated={refetch} />
            ),
            enableOrdering: true,
        },
        {
            field: "creation_date",
            header: "Date created",
            cell: (upload) => convertDateToString(upload.creation_date),
            enableOrdering: true,
        },
        {
            field: "is_done",
            header: "Processed",
            cell: (upload) =>
                upload.is_done ? (
                    <Icon as={AiOutlineCheckCircle} boxSize={6} color="green" />
                ) : (
                    <Icon
                        as={AiOutlineClockCircle}
                        boxSize={6}
                        color="yellow.400"
                    />
                ),
            enableOrdering: true,
        },
    ];

    const filteringOptions: FilteringOption[] = [
        { field: "filename", name: "Filename", type: "char" },
        { field: "is_done", name: "Processed", type: "boolean" },
    ];

    return (
        <Table
            columnDefs={columnDefs}
            filteringOptions={filteringOptions}
            mainFilteringField="filename"
            onFilteringChange={(filters) =>
                setUploadQuery({ ...uploadQuery, filters })
            }
            defaultOrdering={defaultOrdering}
            onOrderingChange={(ordering) =>
                setUploadQuery({ ...uploadQuery, ordering })
            }
            defaultPageSize={defaultPageSize}
            onPaginationChange={(pagination) =>
                setUploadQuery({ ...uploadQuery, pagination })
            }
            data={uploads.results}
            totalItems={uploads.count}
        />
    );
});

export default UploadTable;
