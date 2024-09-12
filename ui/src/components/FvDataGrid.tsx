import { KLabelTrackingProducts } from "@foodvibes/utils/commonConstants";
import {
    IconButtonAddNew,
    IconButtonRefresh,
    StyledIconButton1GridRow,
    StyledIconButton2GridRow,
    StyledIconButton3GridRow,
    SubTitle,
} from "@foodvibes/utils/commonStyles";
import { QueryResponseType } from "@foodvibes/utils/commonTypes";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import LinkIcon from '@mui/icons-material/Link';
import RefreshIcon from "@mui/icons-material/Refresh";
import {
    DialogActions,
    DialogContent,
    DialogProps,
    FormControlLabel,
    Switch,
    Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import {
    MRT_ColumnFiltersState,
    MRT_EditActionButtons,
    MRT_PaginationState,
    MRT_RowData,
    MRT_SortingState,
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from "material-react-table";
import { SetStateAction } from "react";
import { GetDialogTitle, GetDialogTitleInner } from "./FvDialogCommon";

export default function FvDataGrid<T extends MRT_RowData>({
    icon,
    label,
    modalMode,
    readOnly,
    columns,
    columnFilters,
    queryResponse,
    includeDetails,
    globalFilter,
    isLoading,
    pagination,
    sorting,
    contentCreate,
    contentEdit,
    bookmark,
    report,
    links,
    fetch,
    upsert,
    setIncludeDetails,
    setColumnFilters,
    setGlobalFilter,
    setPagination,
    setSorting,
    setMessage,
}: {
    icon: string;
    label: string;
    modalMode?: boolean | null;
    readOnly?: boolean | null;
    columns: MRT_ColumnDef<T>[];
    columnFilters: MRT_ColumnFiltersState;
    queryResponse: QueryResponseType<T>;
    includeDetails: boolean;
    globalFilter: string;
    isLoading: boolean;
    pagination: MRT_PaginationState;
    sorting: MRT_SortingState;
    contentCreate?: () => void;
    contentEdit?: (row: T) => void;
    bookmark?: ((payload: any) => void) | null;
    report?: ((payload: T) => void) | null;
    links?: ((payload: T) => void) | null;
    fetch: () => void;
    upsert?: (payload: any) => Promise<void>;
    setIncludeDetails: (value: boolean) => void;
    setColumnFilters: (value: SetStateAction<MRT_ColumnFiltersState>) => void;
    setGlobalFilter: (value: SetStateAction<string>) => void;
    setPagination: (value: SetStateAction<MRT_PaginationState>) => void;
    setSorting: (value: SetStateAction<MRT_SortingState>) => void;
    setMessage: (message?: string) => void;
}) {
    const table = useMaterialReactTable({
        enableStickyFooter: true,
        enableStickyHeader: true,
        columns,
        data: (queryResponse?.data as any) ?? [],
        getRowId: row => `${row.orm_id}`,
        rowCount: queryResponse?.meta?.row_count ?? 0,
        initialState: {
            density: "compact",
            showColumnFilters: false,
            showGlobalFilter: true,
            columnPinning: {
                left: ["mrt-row-actions"],
            },
        },
        state: {
            columnFilters,
            globalFilter,
            // isLoading,
            pagination,
            // showAlertBanner: isError,
            // showProgressBars: isLoading,
            sorting,
            // isSaving: isLoading,
        },
        enableFullScreenToggle: false,
        manualFiltering: true, //turn off built-in client-side filtering
        manualPagination: true, //turn off built-in client-side pagination
        manualSorting: true, //turn off built-in client-side sorting
        muiSearchTextFieldProps: {
            placeholder: "Omni search terms",
            sx: { minWidth: "200px" },
            variant: "outlined",
        },
        // muiToolbarAlertBannerProps: isError
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onCreatingRowCancel: () => setMessage(),
        onCreatingRowSave: upsert,
        onEditingRowCancel: () => setMessage(),
        onEditingRowSave: upsert,
        enableRowSelection: false, //enable some features
        enableColumnOrdering: true, //enable a feature for all columns
        enableGlobalFilter: true, //turn off a feature
        enableColumnResizing: true,
        columnResizeMode: "onEnd",
        layoutMode: "semantic",
        enableCellActions: true,
        enableClickToCopy: "context-menu",
        enableColumnPinning: true,
        createDisplayMode: "modal", //default ('row', and 'custom' are also available)
        editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        enableRowActions: true,
        enableColumnFilters: true,
        muiTableBodyCellProps: ({ cell, column, table }) => ({
            onClick: () => {
                table.setEditingCell(cell); //set editing cell
                //optionally, focus the text field
                queueMicrotask(() => {
                    const textField =
                        table.refs.editInputRefs.current[column.id];
                    if (textField) {
                        textField.focus();
                        textField.select?.();
                    }
                });
            },
        }),
        muiTableContainerProps: {
            sx: {
                minHeight: "100%",
                maxHeight: `calc(100vh - ${modalMode ? 300 : 180}px)`,
            },
        },
        muiTablePaperProps: ({ table }) => ({
            //not sx
            sx: {
                // bottom: 0,
                // height: `calc(100vh - ${modalMode ? 300 : 180}px)`,
                // left: 0,
                // margin: 0,
                // maxHeight: '100vh',
                // maxWidth: '100vw',
                // padding: 0,
                // position: 'fixed',
                // right: 0,
                // top: 0,
                // width: '100vw',
                // zIndex: table.getState().isFullScreen ? 1000 : 999,
                // display: 'block',
            },
        }),
        muiEditRowDialogProps: {
            fullWidth: true,
            maxWidth: "lg",
        } as DialogProps,
        muiTableBodyProps: {
            sx: {
                //stripe the rows, make odd rows a darker color
                "& tr:nth-of-type(odd) > td": {
                    backgroundColor: "gainsboro",
                },
            },
        },
        renderCreateRowDialogContent: ({
            table,
            row,
            internalEditComponents,
        }) => (
            <>
                {GetDialogTitle("Create New ", icon, label)}
                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {internalEditComponents}
                </DialogContent>
                <DialogActions>
                    {/* eslint-disable-next-line react/jsx-pascal-case */}
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
                </DialogActions>
            </>
        ),
        renderEditRowDialogContent: ({
            table,
            row,
            internalEditComponents,
        }) => (
            <>
                {GetDialogTitle("Edit ", icon, label)}
                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {internalEditComponents}
                </DialogContent>
                <DialogActions>
                    {/* eslint-disable-next-line react/jsx-pascal-case */}
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
                </DialogActions>
            </>
        ),
        renderRowActions: ({ row, table }) => (
            <Box sx={{
                display: "block",
                gap: "0",
                textAlign: "center",
                backgroundColor: row.original['is_history'] === '0' ? "transparent" : "lightpink",
                borderRadius: "6px",
            }}>
                <Tooltip title={row.original['is_history'] === '0' && !readOnly ? "Edit" : "Historical record"}>
                    <StyledIconButton1GridRow
                        onClick={() => {
                            if (row.original['is_history'] === '0' && !readOnly) {
                                if (contentEdit) {
                                    contentEdit(row.original);
                                } else {
                                    table.setEditingRow(row);
                                }
                            }
                        }}
                    >
                        {row.original['is_history'] === '0' && !readOnly && <EditIcon />}
                    </StyledIconButton1GridRow>
                </Tooltip>
                {report && (
                    <Tooltip title="View history report">
                        <StyledIconButton2GridRow
                            onClick={() => report(row.original)}
                        >
                            <HistoryIcon />
                        </StyledIconButton2GridRow>
                    </Tooltip>
                )}
                {links && (
                    <Tooltip title={`List all "${KLabelTrackingProducts}" entries linked to this "${label}"`}>
                        <StyledIconButton2GridRow
                            onClick={() => links(row.original)}
                        >
                            <LinkIcon />
                        </StyledIconButton2GridRow>
                    </Tooltip>
                )}
                {bookmark && (
                    <Tooltip
                        title={`Select this "${label}"`}
                    >
                        <StyledIconButton3GridRow onClick={() => bookmark(row.original)}>
                            <BookmarkIcon />
                        </StyledIconButton3GridRow>
                    </Tooltip>
                )}
            </Box>
        ),
        renderTopToolbarCustomActions: ({ table }) => (
            <SubTitle>{GetDialogTitleInner("", icon, label)}</SubTitle>
        ),
        renderBottomToolbarCustomActions: () => (
            <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <Typography>
                    {readOnly ? <></> : <Tooltip arrow title="Add New Entry">
                        <span>
                            <IconButtonAddNew
                                onClick={() => {
                                    if (contentCreate) {
                                        contentCreate();
                                    } else {
                                        table.setCreatingRow(true); //simplest way to open the create row modal with no default values
                                    }
                                }}
                                disabled={isLoading}
                            >
                                <AddCircleIcon />
                            </IconButtonAddNew>
                        </span>
                    </Tooltip>}
                    <Tooltip arrow title="Refresh Data">
                        <span>
                            <IconButtonRefresh
                                onClick={fetch}
                                disabled={isLoading}
                            >
                                <RefreshIcon />
                            </IconButtonRefresh>
                        </span>
                    </Tooltip>
                    {modalMode ? <></> : <FormControlLabel
                        disabled={isLoading}
                        control={
                            <Switch
                                checked={includeDetails}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>,
                                    checked: boolean,
                                ) => setIncludeDetails(checked)}
                            />
                        }
                        label={
                            <span
                                style={{
                                    margin: "0",
                                    padding: "0",
                                    fontSize: "0.7rem",
                                    fontWeight: "bold",
                                    fontFamily: "tahoma,arial,sans-serif",
                                    color: "#1a2027",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Include Full History
                            </span>
                        }
                    />}
                </Typography>
            </Box>
        ),
    });

    // const globalTheme = useTheme(); //(optional) if you already have a theme defined in your app root, you can import here
    // const tableTheme = useMemo(
    //     () =>
    //         createTheme({
    //             palette: {
    //                 mode: globalTheme.palette.mode, //let's use the same dark/light mode as the global theme
    //                 primary: globalTheme.palette.secondary, //swap in the secondary color as the primary for the table
    //                 info: {
    //                     main: 'rgb(255,122,0)', //add in a custom color for the toolbar alert background stuff
    //                 },
    //                 backgroundColor: {
    //                     default:
    //                         globalTheme.palette.mode === 'light'
    //                             ? 'rgb(254,255,244)' //random light yellow color for the background in light mode
    //                             : '#000', //pure black table in dark mode for fun
    //                 },
    //             },
    //             typography: {
    //                 button: {
    //                     textTransform: 'none', //customize typography styles for all buttons in table by default
    //                     fontSize: '1.2rem',
    //                 },
    //             },
    //             components: {
    //                 MuiTooltip: {
    //                     styleOverrides: {
    //                         tooltip: {
    //                             fontSize: '1.1rem', //override to make tooltip font size larger
    //                         },
    //                     },
    //                 },
    //                 MuiSwitch: {
    //                     styleOverrides: {
    //                         thumb: {
    //                             color: 'pink', //change the color of the switch thumb in the columns show/hide menu to pink
    //                         },
    //                     },
    //                 },
    //             },
    //         }),
    //     [globalTheme],
    // );

    return (
        // <ThemeProvider theme={tableTheme}>
        <MaterialReactTable table={table} />
        // </ThemeProvider>
    );
}
