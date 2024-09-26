import { GetColumnsTemplate, ScCircleType } from "@foodvibes/utils/commonTypes";
import { MRT_ColumnDef } from "material-react-table";

export const scCircleColumns = (): MRT_ColumnDef<ScCircleType>[] => {
    const columnsTemplate = GetColumnsTemplate<ScCircleType>();
    const columns: MRT_ColumnDef<ScCircleType>[] = [
        {
            ...columnsTemplate,
            accessorKey: "sc_group_id",
            header: "Group ID",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_id",
            header: "User ID",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "active_roles",
            header: "Circle Role(s)",
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
            accessorKey: "phone",
            header: "Phone",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "access_mask",
            header: "Circle Access Mask",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "active_roles_long",
            header: "Circle Role(s) Long",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "username",
            header: "Circle Username",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_group_username",
            header: "Group Username",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_username",
            header: "User Username",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_group_description",
            header: "G Description",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_circle_ledger_id",
            header: "Ledger ID",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_circle_tx_id",
            header: "Ledger TX",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_group_ledger_id",
            header: "G Ledger ID",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_group_tx_id",
            header: "G Ledger TX",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_ledger_id",
            header: "U Ledger ID",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_tx_id",
            header: "U Ledger TX",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_access_mask",
            header: "Non-Circle Access Mask",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_active_roles",
            header: "U Non-Circle Role(s)",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_active_roles_long",
            header: "U Non-Circle Role(s) Long",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_is_history",
            header: "U Is History",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_operation_name",
            header: "U Operation Name",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_user_created_at",
            header: "U DB Created",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_group_is_history",
            header: "G Is History",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_group_operation_name",
            header: "G Operation Name",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_group_created_at",
            header: "G DB Created",
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
    ];

    return columns;
};
