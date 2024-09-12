import { useMsal } from "@azure/msal-react";
import { useAppDispatch, useAppSelector } from "@foodvibes/app/hooks";
import {
    actionSetBookmarkedProduct,
    actionSetBookmarkedScCircle,
    actionSetBookmarkedScGroup,
    actionSetBookmarkedScUser,
    actionSetEditFields,
    actionSetEditorOpen,
    selectAccessToken,
    selectAssumedAccessMask,
    selectAssumedUsername,
    selectEditFields,
    selectEditorOpen,
    selectIsClean,
    selectModalOpenScCircleHistory
} from "@foodvibes/app/mainSlice";
import iconScCircle from "@foodvibes/assets/sc_circle.png";
import styles from "@foodvibes/components/FvCommon.module.css";
import FvDataGrid from "@foodvibes/components/FvDataGrid";
import { FvIdNoAccessMessage } from "@foodvibes/components/FvIdNoAccessMessage";
import { FvScCircleModalAll } from "@foodvibes/features/commonModals/FvScCircleModalAll";
import {
    KLabelScCircle,
    KLedgerIdAltSearchTokenPrefix,
    KLedgerIdAltSearchTokenSuffix,
    KLedgerIdSearchTokenPrefix,
    KLedgerIdSearchTokenSuffix,
    KMenuLabelCircleConfiguration
} from "@foodvibes/utils/commonConstants";
import {
    HaveError,
    QueryParamsCompareToQueryParams,
    QueryParamsCompareToQueryParamsApi,
    QueryParamsInit
} from "@foodvibes/utils/commonFunctions";
import { MenuItems } from "@foodvibes/utils/commonLookups";
import CommonMessageSend from "@foodvibes/utils/commonMessageSend";
import {
    CommonError,
    EditFieldsType,
    MenuItemType,
    QueryParamsApiType,
    QueryParamsType,
    QueryResponseType,
    ScCirclePutType,
    ScCircleType,
    ScGroupType,
    ScUserType
} from "@foodvibes/utils/commonTypes";
import { Box } from "@mui/material";
import {
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState,
} from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { useMatches } from "react-router-dom";
import { scCircleColumns } from "./scCircleColumns";
import {
    actionSelectScCircle,
    actionSetLastId,
    actionSetQueryParams,
    actionUpsertScCircle,
    selectGetQueryParams,
    selectLastIdScCircle,
    selectScCircleIsLoading,
    selectScCircleResponse,
    setClearStateResponse
} from "./scCircleSlice";

export const ScCircle = ({
    modalMode,
    readOnly,
}: {
    modalMode?: boolean | null;
    readOnly?: boolean | null;
}) => {
    const matches = useMatches();
    const id2Use = matches[matches.length - 1].params["id"];
    const { instance } = useMsal();
    const dispatch = useAppDispatch();
    const accessToken: string | null = useAppSelector(selectAccessToken);
    const assumedUsername: string | null = useAppSelector(selectAssumedUsername);
    const assumedAccessMask: number | null = useAppSelector(selectAssumedAccessMask);
    const getQueryParams: QueryParamsType = useAppSelector(selectGetQueryParams);
    const isLoading: boolean = useAppSelector(selectScCircleIsLoading);
    const isEditorOpen: boolean = useAppSelector(selectEditorOpen) ?? false;
    const isModalOpenScCircleHistory: boolean = useAppSelector(selectModalOpenScCircleHistory) ?? false;
    const lastId: number = useAppSelector(selectLastIdScCircle);
    const scCircleResponse: QueryResponseType<ScCircleType> = useAppSelector(selectScCircleResponse);
    const editFields: EditFieldsType | null = useAppSelector(selectEditFields);
    const isClean: boolean | null = useAppSelector(selectIsClean);
    const setLastId = (lastId: number) => dispatch(actionSetLastId(lastId));
    const setEditorOpen = (payload: boolean) => dispatch(actionSetEditorOpen(payload));
    const setQueryParams = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParams(payload));
    const setEditFields = (payload: EditFieldsType | null) => dispatch(actionSetEditFields(payload));
    const selectScCircle = (queryParams: QueryParamsType) => dispatch(actionSelectScCircle({
        queryParams: {
            ...queryParams,
            impersonatedUser: assumedUsername ?? "",
        }, accessToken, instance,
    }));
    const upsertScCircle = (queryParams: QueryParamsType, rowToUpsert: ScCirclePutType) => dispatch(actionUpsertScCircle({
        queryParams: {
            ...queryParams,
            impersonatedUser: assumedUsername ?? "",
        }, rowToUpsert, accessToken, instance
    }));
    const [doLoad, setDoLoad] = useState<boolean>(false);
    const [id2UseNum, setId2UseNum] = useState<number>(0);
    const [includeDetails, setIncludeDetails] = useState<boolean>(getQueryParams?.includeDetails,);
    const [globalFilter, setGlobalFilter] = useState<string>(getQueryParams?.globalFilter,);
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(getQueryParams?.columnFilters,);
    const [sorting, setSorting] = useState<MRT_SortingState>(getQueryParams?.sorting,);
    const [pagination, setPagination] = useState<MRT_PaginationState>(getQueryParams?.pagination,);

    const [keepEditorOpen, setKeepEditorOpen] = useState<boolean>(false);
    const columns = useMemo<MRT_ColumnDef<ScCircleType>[]>(() => scCircleColumns(), [],);
    const menuItem: MenuItemType | undefined = useMemo<MenuItemType | undefined>(() => MenuItems.find(
        e => e.label === KMenuLabelCircleConfiguration && (assumedAccessMask ?? 0) & e.accessMask), [assumedAccessMask]);
    const bookmark = (row: ScCircleType | null) => {
        dispatch(actionSetBookmarkedScCircle(row ?? null));
    };
    const fetch = async () => {
        await selectScCircle(QueryParamsInit(getQueryParams));
    };
    const fetchReportRows = async (ledgerId: number | null) => {
        await selectScCircle(
            QueryParamsInit({
                includeDetails: false,
                reportMode: true,
                globalFilter: `${KLedgerIdAltSearchTokenPrefix}${ledgerId ?? 0}${KLedgerIdAltSearchTokenSuffix}`,
            }),
        );
    };
    const reportSub = async (ledgerId: number) => {
        await fetchReportRows(ledgerId);
    };
    const upsert = async (keepEditorOpenNew: boolean, saveAsNew?: boolean, softDeleted?: boolean) => {
        const ledger_id: number = saveAsNew ? 0 : editFields?.incoming?.sc_circle_ledger_id ?? 0;
        const access_mask: number = editFields?.incoming?.access_mask ?? 0;
        const description: string = editFields?.incoming?.description ?? "";
        const sc_user_ledger_id: number = editFields?.incoming?.sc_user_ledger_id ?? 0;
        const sc_user_tx_id: number = editFields?.incoming?.sc_user_tx_id ?? 0;
        const sc_group_ledger_id: number = editFields?.incoming?.sc_group_ledger_id ?? 0;
        const sc_group_tx_id: number = editFields?.incoming?.sc_group_tx_id ?? 0;
        const deleted: boolean = softDeleted ?? editFields?.incoming?.deleted ?? false;
        const username = editFields?.incoming?.username ?? "";
        const rowToUpsert: ScCirclePutType = {
            ledger_id,
            access_mask,
            sc_user_ledger_id,
            sc_user_tx_id,
            sc_group_ledger_id,
            sc_group_tx_id,
            deleted,
            username,
        };
        await upsertScCircle(QueryParamsInit(getQueryParams), rowToUpsert);
        setKeepEditorOpen(keepEditorOpenNew);

        if (!keepEditorOpenNew) {
            bookmark(null);
            dispatch(actionSetBookmarkedProduct(null));
            dispatch(actionSetBookmarkedScGroup(null));
            setEditFields(null);
            setEditorOpen(false);
        }
    };
    const contentEdit = (row?: ScCircleType): void => {
        setLastId(0);
        setEditFields(null);

        const editFieldsNew: EditFieldsType = {
            current: {},
            incoming: {},
        };

        if (row) {
            reportSub(row.sc_circle_ledger_id);
            bookmark({ ...row });
            dispatch(
                actionSetBookmarkedScUser({
                    orm_id: 0,
                    is_history: false,
                    sc_user_ledger_id: row.sc_user_ledger_id,
                    sc_user_tx_id: row.sc_user_tx_id,
                    sc_user_id: row.sc_user_id,
                    email_addr: row.email_addr,
                    phone: row.phone,
                    access_mask: row.sc_user_access_mask,
                    operation_name: row.sc_user_operation_name,
                    created_at: row.sc_user_created_at,
                    username: row.sc_user_username,
                } as ScUserType),
            );
            dispatch(
                actionSetBookmarkedScGroup({
                    orm_id: 0,
                    is_history: false,
                    sc_group_ledger_id: row.sc_group_ledger_id,
                    sc_group_tx_id: row.sc_group_tx_id,
                    sc_group_id: row.sc_group_id,
                    description: row.sc_group_description,
                    operation_name: row.sc_group_operation_name,
                    created_at: row.sc_group_created_at,
                    username: row.sc_group_username,
                } as ScGroupType),
            );

            editFieldsNew.current = {
                sc_circle_ledger_id: row.sc_circle_ledger_id,
                access_mask: row.access_mask,
                sc_user_ledger_id: row.sc_user_ledger_id,
                sc_user_tx_id: row.sc_user_tx_id,
                sc_group_ledger_id: row.sc_group_ledger_id,
                sc_group_tx_id: row.sc_group_tx_id,
            };
        } else {
            reportSub(0);
            bookmark(null);
            dispatch(actionSetBookmarkedScUser(null));
            dispatch(actionSetBookmarkedScGroup(null));

            editFieldsNew.current = {
                sc_circle_ledger_id: 0,
            };
        }

        editFieldsNew.incoming = {
            ...editFieldsNew.current,
        };

        setEditFields(editFieldsNew);
        setEditorOpen(true);
    };
    // Hooks
    useEffect(() => {
        // Component dismount hook to clean the state's response error
        return () => {
            dispatch(setClearStateResponse());
        };
    }, []);
    useEffect(() => {
        if (!scCircleResponse?.error?.message?.length) {
            return;
        }

        CommonMessageSend(dispatch, scCircleResponse?.error as CommonError,);
    }, [scCircleResponse?.error]);
    useEffect(() => {
        if (modalMode || !id2Use) {
            return;
        }

        setId2UseNum(Number(id2Use ?? "0"));
    }, [id2Use]);
    useEffect(() => {
        const queryParams: QueryParamsType = {
            columnFilters,
            globalFilter,
            includeDetails,
            reportMode: false,
            pagination,
            sorting,
            impersonatedUser: "",
            groupId: 0,
        };

        if ((doLoad && !id2UseNum) && QueryParamsCompareToQueryParams(queryParams, getQueryParams)) {
            return;
        }

        if (!doLoad) {
            setDoLoad(true);
        }

        console.info(queryParams);
        dispatch(setQueryParams(queryParams));
    }, [
        includeDetails,
        globalFilter,
        columnFilters,
        sorting,
        pagination,
    ]);
    useEffect(() => {
        if (
            !doLoad ||
            isLoading ||
            HaveError(scCircleResponse?.error) ||
            QueryParamsCompareToQueryParamsApi(
                getQueryParams,
                scCircleResponse.meta?.query_params as QueryParamsApiType,
            )
        ) {
            return;
        }

        if (id2UseNum) {
            const id2Use: number = id2UseNum;

            setId2UseNum(0);
            setGlobalFilter(`${KLedgerIdSearchTokenPrefix}${id2Use}${KLedgerIdSearchTokenSuffix}`);
            setLastId(id2Use);
        } else {
            fetch();
        }
    }, [doLoad, getQueryParams]);
    useEffect(() => {
        if (!lastId) {
            return;
        }

        if (keepEditorOpen) {
            fetchReportRows(lastId);
        }
    }, [lastId, keepEditorOpen]);
    useEffect(() => {
        if (getQueryParams?.globalFilter?.includes(KLedgerIdSearchTokenPrefix) && scCircleResponse?.data?.length) {
            bookmark(scCircleResponse.data[0] ?? null);
        }
    }, [getQueryParams?.globalFilter, scCircleResponse?.data?.length]);
    useEffect(() => {
        if (
            !keepEditorOpen ||
            !lastId ||
            !scCircleResponse?.data?.length
        ) {
            return;
        }

        const rowToUse: ScCircleType | undefined =
            scCircleResponse.data.find(
                d => d.sc_circle_ledger_id === lastId,
            );

        if (rowToUse) {
            contentEdit(rowToUse);
        }
    }, [keepEditorOpen, lastId, scCircleResponse]);
    useEffect(() => {
        if (isEditorOpen || isModalOpenScCircleHistory) {
            if (scCircleResponse?.reportData?.length) {
                bookmark(scCircleResponse?.reportData[0]);
            }
        } else {
            bookmark(null);
        }
    }, [isModalOpenScCircleHistory, scCircleResponse?.reportData]);

    return !menuItem ? <FvIdNoAccessMessage /> : (
        <>
            <FvScCircleModalAll
                isClean={isClean}
                upsertScCircle={upsert}
                editFields={editFields}
                setEditFields={setEditFields}
            />

            <Box className={styles.row}>
                <FvDataGrid
                    icon={iconScCircle}
                    label={KLabelScCircle}
                    modalMode={modalMode}
                    readOnly={readOnly}
                    columns={columns}
                    columnFilters={columnFilters}
                    queryResponse={scCircleResponse}
                    includeDetails={includeDetails}
                    globalFilter={globalFilter}
                    isLoading={isLoading}
                    pagination={pagination}
                    sorting={sorting}
                    contentCreate={() => contentEdit()}
                    contentEdit={row => contentEdit(row)}
                    fetch={fetch}
                    setIncludeDetails={setIncludeDetails}
                    setColumnFilters={setColumnFilters}
                    setGlobalFilter={setGlobalFilter}
                    setPagination={setPagination}
                    setSorting={setSorting}
                    setMessage={(message?: string) => {
                        CommonMessageSend(dispatch, { message } as CommonError);
                    }}
                />
            </Box>
        </>
    );
};
