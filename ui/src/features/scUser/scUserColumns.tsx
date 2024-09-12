import { GetColumnsTemplate, ScUserType } from "@foodvibes/utils/commonTypes";
import { MRT_ColumnDef } from "material-react-table";

export const scUserColumns = (): MRT_ColumnDef<ScUserType>[] => {
    const columnsTemplate = GetColumnsTemplate<ScUserType>();
    const columns: MRT_ColumnDef<ScUserType>[] = [
        {
            ...columnsTemplate,
            accessorKey: "sc_user_id",
            header: "User ID",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "email_addr",
            header: "Email Addr",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "access_mask",
            header: "Access Mask",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "active_roles",
            header: "Default Role(s)",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "active_roles_long",
            header: "Default Role(s) Long",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "username",
            header: "User Username",
        },
        {
            ...columnsTemplate,
            accessorKey: "phone",
            header: "Phone",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "operation_name",
            header: "Operation Name",
        },
        {
            ...columnsTemplate,
            accessorKey: "created_at",
            header: "DB Created",
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
            accessorKey: "sc_user_ledger_id",
            header: "Ledger ID",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_tx_id",
            header: "Ledger TX",
        },
    ];

    return columns;
};
