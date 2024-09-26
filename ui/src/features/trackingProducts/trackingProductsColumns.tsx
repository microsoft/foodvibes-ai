import { FormatTimestamp } from "@foodvibes/utils/commonFunctions";
import {
    GetColumnsTemplate,
    TrackingProductsType,
} from "@foodvibes/utils/commonTypes";
import { MRT_ColumnDef } from "material-react-table";

export const trackingProductsColumns =
    (): MRT_ColumnDef<TrackingProductsType>[] => {
        const columnsTemplate = GetColumnsTemplate<TrackingProductsType>();
        const columns: MRT_ColumnDef<TrackingProductsType>[] = [
            {
                ...columnsTemplate,
                accessorKey: "recorded_at",
                header: "Recorded At",
                enableEditing: true,
                Cell: ({ renderedCellValue }) => (
                    <>{FormatTimestamp(renderedCellValue?.toString())}</>
                ),
                // muiTableHeadCellProps: { style: { color: 'green' } }, //custom props
            } as MRT_ColumnDef<TrackingProductsType>,
            {
                ...columnsTemplate,
                accessorKey: "product_id",
                header: "Product ID",
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_id",
                header: "Geo ID",
            },
            {
                ...columnsTemplate,
                accessorKey: "tracking_products_ledger_id",
                header: "Ledger ID",
            },
            {
                ...columnsTemplate,
                accessorKey: "rank_curr_ledger_id",
                header: "Entry Count",
            },
            {
                ...columnsTemplate,
                accessorKey: "username",
                header: "When User",
            },
            {
                ...columnsTemplate,
                accessorKey: "product_username",
                header: "What User",
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_username",
                header: "Where User",
            },
            {
                ...columnsTemplate,
                accessorKey: "notes",
                header: "Notes",
            },
            {
                ...columnsTemplate,
                accessorKey: "properties",
                header: "properties",
                enableEditing: true,
            },
            {
                ...columnsTemplate,
                accessorKey: "operation_name",
                header: "Operation",
            },
            {
                ...columnsTemplate,
                accessorKey: "product_ledger_id",
                header: "P Ledger ID",
                enableEditing: true,
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_ledger_id",
                header: "G Ledg ID",
                enableEditing: true,
            },
            {
                ...columnsTemplate,
                accessorKey: "tracking_products_tx_id",
                header: "Tx ID",
            },
            {
                ...columnsTemplate,
                accessorKey: "created_at",
                header: "DB Created",
                Cell: ({ renderedCellValue }) => (
                    <>{FormatTimestamp(renderedCellValue?.toString())}</>
                ),
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_tx_id",
                header: "G Tx ID",
            },
            {
                ...columnsTemplate,
                accessorKey: "prev_product_ledger_id",
                header: "P Prev Ledger ID",
                enableEditing: true,
            },
            {
                ...columnsTemplate,
                accessorKey: "product_tx_id",
                header: "P Tx ID",
            },
            // Geotrack
            {
                ...columnsTemplate,
                accessorKey: "name",
                header: "Name",
            },
            {
                ...columnsTemplate,
                accessorKey: "details",
                header: "Details",
            },
            {
                ...columnsTemplate,
                accessorKey: "prev_latitude",
                header: "Prev Latitude",
            },
            {
                ...columnsTemplate,
                accessorKey: "prev_longitude",
                header: "Prev Longitude",
            },
            {
                ...columnsTemplate,
                accessorKey: "latitude",
                header: "Latitude",
            },
            {
                ...columnsTemplate,
                accessorKey: "longitude",
                header: "Longitude",
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_recorded_at",
                header: "G Recorded At",
                Cell: ({ renderedCellValue }) => (
                    <>{FormatTimestamp(renderedCellValue?.toString())}</>
                ),
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_properties",
                header: "G Properties",
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_operation_name",
                header: "G Operation",
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_created_at",
                header: "G DB Created",
                Cell: ({ renderedCellValue }) => (
                    <>{FormatTimestamp(renderedCellValue?.toString())}</>
                ),
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_image_id",
                header: "G Image ID",
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_image_url",
                header: "G Image URL",
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_is_history",
                header: "G Is History",
            },
            {
                ...columnsTemplate,
                accessorKey: "geotrack_movement",
                header: "G Movement",
            },
            // Product
            {
                ...columnsTemplate,
                accessorKey: "description",
                header: "Description",
            },
            {
                ...columnsTemplate,
                accessorKey: "quantity",
                header: "Quantity",
            },
            {
                ...columnsTemplate,
                accessorKey: "storage_tier",
                header: "Storage Tier",
            },
            {
                ...columnsTemplate,
                accessorKey: "product_recorded_at",
                header: "P Recorded At",
                Cell: ({ renderedCellValue }) => (
                    <>{FormatTimestamp(renderedCellValue?.toString())}</>
                ),
            },
            {
                ...columnsTemplate,
                accessorKey: "product_properties",
                header: "P Properties",
            },
            {
                ...columnsTemplate,
                accessorKey: "product_operation_name",
                header: "P operation",
            },
            {
                ...columnsTemplate,
                accessorKey: "product_created_at",
                header: "P DB Created",
                Cell: ({ renderedCellValue }) => (
                    <>{FormatTimestamp(renderedCellValue?.toString())}</>
                ),
            },
            {
                ...columnsTemplate,
                accessorKey: "product_image_id",
                header: "P Image ID",
            },
            {
                ...columnsTemplate,
                accessorKey: "product_image_url",
                header: "P Image URL",
            },
            {
                ...columnsTemplate,
                accessorKey: "product_is_history",
                header: "P Is History",
            },
            {
                ...columnsTemplate,
                accessorKey: "product_aggregation",
                header: "P Aggregation",
            },
            //
            {
                ...columnsTemplate,
                accessorKey: "is_history",
                header: "Is History",
            },
            {
                ...columnsTemplate,
                accessorKey: "orm_id",
                header: "ORM ID",
            },
        ];

        return columns;
    };
