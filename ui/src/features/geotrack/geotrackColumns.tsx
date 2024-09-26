import { GeotrackType, GetColumnsTemplate } from "@foodvibes/utils/commonTypes";
import { MRT_ColumnDef } from "material-react-table";

export const geotrackColumns = (): MRT_ColumnDef<GeotrackType>[] => {
    const columnsTemplate = GetColumnsTemplate<GeotrackType>();
    const columns: MRT_ColumnDef<GeotrackType>[] = [
        {
            ...columnsTemplate,
            accessorKey: "geotrack_id",
            header: "Geo ID",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "name",
            header: "Name",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "username",
            header: "Where Username",
        },
        {
            ...columnsTemplate,
            accessorKey: "geotrack_ledger_id",
            header: "Ledger ID",
        },
        {
            ...columnsTemplate,
            accessorKey: "details",
            header: "Details",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "latitude",
            header: "Latitude",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "longitude",
            header: "Longitude",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "recorded_at",
            header: "Recorded",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "operation_name",
            header: "Operation Name",
        },
        {
            ...columnsTemplate,
            accessorKey: "properties",
            header: "Properties",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "created_at",
            header: "DB Created",
        },
        {
            ...columnsTemplate,
            accessorKey: "image_id",
            header: "Image ID",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "image_url",
            header: "Image URL",
        },
        {
            ...columnsTemplate,
            accessorKey: "orm_id",
            header: "ORM ID",
        },
        {
            ...columnsTemplate,
            accessorKey: "is_history",
            header: "Is History",
        },
        {
            ...columnsTemplate,
            accessorKey: "geotrack_tx_id",
            header: "Ledger TX",
        },
    ];

    return columns;
};
