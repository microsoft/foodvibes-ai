import { GetColumnsTemplate, ProductType } from "@foodvibes/utils/commonTypes";
import { MRT_ColumnDef } from "material-react-table";

export const productColumns = (): MRT_ColumnDef<ProductType>[] => {
    const columnsTemplate = GetColumnsTemplate<ProductType>();
    const columns: MRT_ColumnDef<ProductType>[] = [
        {
            ...columnsTemplate,
            accessorKey: "product_id",
            header: "Product ID",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "description",
            header: "Description",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "storage_tier",
            header: "Storage Tier",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "quantity",
            header: "Quantity",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "username",
            header: "What Username",
        },
        {
            ...columnsTemplate,
            accessorKey: "product_ledger_id",
            header: "Ledger ID",
        },
        {
            ...columnsTemplate,
            accessorKey: "operation_name",
            header: "Operation Name",
        },
        {
            ...columnsTemplate,
            accessorKey: "recorded_at",
            header: "Recorded",
            enableEditing: true,
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
            accessorKey: "product_tx_id",
            header: "Ledger TX",
        },
    ];

    return columns;
};
