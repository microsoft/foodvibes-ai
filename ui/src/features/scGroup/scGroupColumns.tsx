import { GetColumnsTemplate, ScGroupType } from "@foodvibes/utils/commonTypes";
import { MRT_ColumnDef } from "material-react-table";

export const scGroupColumns = (): MRT_ColumnDef<ScGroupType>[] => {
    const columnsTemplate = GetColumnsTemplate<ScGroupType>();
    const columns: MRT_ColumnDef<ScGroupType>[] = [
        {
            ...columnsTemplate,
            accessorKey: "sc_group_id",
            header: "ID",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "created_at",
            header: "DB Created",
        },
        {
            ...columnsTemplate,
            accessorKey: "username",
            header: "Group Username",
        },
        {
            ...columnsTemplate,
            accessorKey: "description",
            header: "Description",
            enableEditing: true,
        },
        {
            ...columnsTemplate,
            accessorKey: "operation_name",
            header: "Operation Name",
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
            accessorKey: "sc_group_ledger_id",
            header: "Ledger ID",
        },
        {
            ...columnsTemplate,
            accessorKey: "sc_group_tx_id",
            header: "Ledger TX",
        },
    ];

    return columns;
};
