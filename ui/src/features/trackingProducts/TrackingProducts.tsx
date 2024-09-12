import { useMsal } from "@azure/msal-react";
import { useAppDispatch, useAppSelector } from "@foodvibes/app/hooks";
import {
    actionSetBookmarkedGeotrack,
    actionSetBookmarkedProduct,
    actionSetBookmarkedTrackingProducts,
    actionSetEditFields,
    actionSetEditorOpen,
    actionSetModalOpenTrackingProductsHistory,
    selectAccessToken,
    selectAssumedAccessMask,
    selectAssumedUsername,
    selectEditFields,
    selectEditorOpen,
    selectIsClean,
    selectModalOpenTrackingProductsHistory
} from "@foodvibes/app/mainSlice";
import iconTrackingProducts from "@foodvibes/assets/tracking-products.png";
import styles from "@foodvibes/components/FvCommon.module.css";
import FvDataGrid from "@foodvibes/components/FvDataGrid";
import { FvTrackingProductsModalAll } from "@foodvibes/features/commonModals/FvTrackingProductsModalAll";
import { KLabelTrackingProducts, KLedgerIdSearchTokenPrefix, KLedgerIdSearchTokenSuffix, KRoleGlobalOwner, KRoleSupplyChainOwner } from "@foodvibes/utils/commonConstants";
import {
    HaveError,
    NowTimestamp,
    QueryParamsCompareToQueryParams,
    QueryParamsCompareToQueryParamsApi,
    QueryParamsInit
} from "@foodvibes/utils/commonFunctions";
import CommonMessageSend from "@foodvibes/utils/commonMessageSend";
import {
    CommonError,
    EditFieldsType,
    GeotrackType,
    ProductType,
    QueryParamsApiType,
    QueryParamsType,
    QueryResponseType,
    TrackingProductsPutType,
    TrackingProductsType
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
import { trackingProductsColumns } from "./trackingProductsColumns";
import {
    actionSelectTrackingProducts,
    actionSetCenterCount,
    actionSetCenterCycle,
    actionSetCenterIdx,
    actionSetHistoryTabIndex,
    actionSetLastId,
    actionSetQueryParams,
    actionUpsertTrackingProducts,
    selectCenterCount,
    selectCenterCycle,
    selectCenterIdx,
    selectGetQueryParams,
    selectHistoryTabIndex,
    selectLastIdTrackingProducts,
    selectTrackingProductsLoading,
    selectTrackingProductsResponse,
    setClearStateResponse
} from "./trackingProductsSlice";

export const TrackingProducts = ({
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
    const centerIdx: number = useAppSelector(selectCenterIdx);
    const centerCount: number | null = useAppSelector(selectCenterCount);
    const centerCycle: boolean | null = useAppSelector(selectCenterCycle);
    const getQueryParams: QueryParamsType = useAppSelector(selectGetQueryParams);
    const historyTabIndex: number = useAppSelector(selectHistoryTabIndex);
    const isLoading: boolean = useAppSelector(selectTrackingProductsLoading);
    const isEditorOpen: boolean = useAppSelector(selectEditorOpen) ?? false;
    const isModalOpenTrackingProductsHistory: boolean = useAppSelector(selectModalOpenTrackingProductsHistory) ?? false;
    const lastId: number = useAppSelector(selectLastIdTrackingProducts);
    const trackingProductsResponse: QueryResponseType<TrackingProductsType> = useAppSelector(selectTrackingProductsResponse);
    const editFields: EditFieldsType | null = useAppSelector(selectEditFields);
    const isClean: boolean | null = useAppSelector(selectIsClean);
    const setCenterIdx = (idx: number) => dispatch(actionSetCenterIdx(idx));
    const setCenterCount = (idx: number) => dispatch(actionSetCenterCount(idx));
    const setCenterCycle = (on: boolean) => dispatch(actionSetCenterCycle(on));
    const setHistoryTabIndex = (idx: number) => dispatch(actionSetHistoryTabIndex(idx));
    const setLastId = (lastId: number) => dispatch(actionSetLastId(lastId));
    const setEditorOpen = (payload: boolean) => dispatch(actionSetEditorOpen(payload));
    const setModalOpenTrackingProductsHistory = (payload: boolean) => dispatch(actionSetModalOpenTrackingProductsHistory(payload));
    const setQueryParams = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParams(payload));
    const setEditFields = (payload: EditFieldsType | null) => dispatch(actionSetEditFields(payload));
    const selectTrackingProducts = (queryParams: QueryParamsType) => dispatch(actionSelectTrackingProducts({
        queryParams: {
            ...queryParams,
            impersonatedUser: assumedUsername ?? "",
        }, accessToken, instance,
    }));
    const upsertTrackingProducts = (queryParams: QueryParamsType, rowToUpsert: TrackingProductsPutType) => dispatch(actionUpsertTrackingProducts({
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

    const [showOnMap, setShowOnMap] = useState<boolean>(false);
    const [keepEditorOpen, setKeepEditorOpen] = useState<boolean>(false);
    const [play, setPlay] = useState<NodeJS.Timeout | null>(null);
    const [helperCenterIdx, setHelperCenterIdx] = useState<number>(centerIdx); // Used to ensure setInterval sees the updated centerIdx value
    const columns = useMemo<MRT_ColumnDef<TrackingProductsType>[]>(() => trackingProductsColumns(), [],);
    const bookmark = (row: TrackingProductsType | null) => {
        dispatch(actionSetBookmarkedTrackingProducts(row ?? null));
    };
    const fetch = async () => {
        await selectTrackingProducts(QueryParamsInit(getQueryParams));
    };
    const fetchReportRows = async (ledgerId: number) => {
        await selectTrackingProducts(
            QueryParamsInit({
                includeDetails: true,
                reportMode: true,
                globalFilter: `${KLedgerIdSearchTokenPrefix}${ledgerId}${KLedgerIdSearchTokenSuffix}`,
            }),
        );
    };
    const reportSub = async (ledgerId: number) => {
        setCenterCount(0);
        setCenterIdx(0);
        await fetchReportRows(ledgerId);
    };
    const report = async (
        row: TrackingProductsType | null,
        ledgerId?: number,
    ) => {
        const id2Use: number =
            row?.tracking_products_ledger_id ?? ledgerId ?? 0;

        if (id2Use) {
            await reportSub(id2Use);
            setModalOpenTrackingProductsHistory(true);
        }
    };
    const upsert = async (keepEditorOpenNew: boolean, saveAsNew?: boolean) => {
        const ledger_id: number = saveAsNew ? 0 : editFields?.incoming?.tracking_products_ledger_id ?? 0;
        const product_ledger_id: number = editFields?.incoming?.product_ledger_id ?? 0;
        const product_tx_id: number = editFields?.incoming?.product_tx_id ?? 0;
        const geotrack_ledger_id: number = editFields?.incoming?.geotrack_ledger_id ?? 0;
        const geotrack_tx_id: number = editFields?.incoming?.geotrack_tx_id ?? 0;
        const properties: string = editFields?.incoming?.properties ?? "";
        const recorded_at: string = editFields?.incoming?.recorded_at ?? "";
        const product_aggregation: number = editFields?.incoming?.product_aggregation ?? 0;
        const notes: string = editFields?.incoming?.notes ?? "";
        const username = editFields?.incoming?.username ?? "";
        const rowToUpsert: TrackingProductsPutType = {
            ledger_id,
            geotrack_ledger_id,
            geotrack_tx_id,
            product_ledger_id,
            product_tx_id,
            product_aggregation,
            notes,
            properties,
            recorded_at,
            username,
        };
        await upsertTrackingProducts(QueryParamsInit(getQueryParams), rowToUpsert);
        setKeepEditorOpen(keepEditorOpenNew);

        if (!keepEditorOpenNew) {
            bookmark(null);
            dispatch(actionSetBookmarkedProduct(null));
            dispatch(actionSetBookmarkedGeotrack(null));
            setEditFields(null);
            setEditorOpen(false);
        }
    };
    const contentEdit = (row?: TrackingProductsType): void => {
        setLastId(0);
        setEditFields(null);

        const editFieldsNew: EditFieldsType = {
            current: {},
            incoming: {},
        };

        if (row) {
            reportSub(row.tracking_products_ledger_id);
            bookmark({ ...row });
            dispatch(
                actionSetBookmarkedProduct({
                    orm_id: 0,
                    is_history: false,
                    product_ledger_id: row.product_ledger_id,
                    product_tx_id: row.product_tx_id,
                    product_id: row.product_id,
                    description: row.description,
                    quantity: row.quantity,
                    storage_tier: row.storage_tier,
                    properties: row.product_properties,
                    operation_name: row.product_operation_name,
                    created_at: row.product_created_at,
                    username: row.product_username,
                    image_id: row.product_image_id,
                    image_url: row.product_image_url,
                } as ProductType),
            );
            dispatch(
                actionSetBookmarkedGeotrack({
                    orm_id: 0,
                    is_history: false,
                    geotrack_ledger_id: row.geotrack_ledger_id,
                    geotrack_tx_id: row.geotrack_tx_id,
                    geotrack_id: row.geotrack_id,
                    name: row.name,
                    details: row.details,
                    longitude: row.longitude,
                    latitude: row.latitude,
                    recorded_at: row.recorded_at,
                    properties: row.geotrack_properties,
                    operation_name: row.geotrack_operation_name,
                    created_at: row.geotrack_created_at,
                    username: row.geotrack_username,
                    image_id: row.geotrack_image_id,
                    image_url: row.geotrack_image_url,
                } as GeotrackType),
            );

            editFieldsNew.current = {
                tracking_products_ledger_id: row.tracking_products_ledger_id,
                product_ledger_id: row.product_ledger_id,
                product_tx_id: row.product_tx_id,
                geotrack_ledger_id: row.geotrack_ledger_id,
                geotrack_tx_id: row.geotrack_tx_id,
                properties: row.properties,
                recorded_at: row.recorded_at,
                storage_tier: row.storage_tier,
                product_aggregation: row.product_aggregation,
                notes: row.notes,
            };
        } else {
            reportSub(0);
            bookmark(null);
            dispatch(actionSetBookmarkedProduct(null));
            dispatch(actionSetBookmarkedGeotrack(null));

            editFieldsNew.current = {
                tracking_products_ledger_id: 0,
            };
        }

        editFieldsNew.incoming = {
            ...editFieldsNew.current,
            recorded_at: editFieldsNew.current?.recorded_at ?? NowTimestamp(),
        };

        setEditFields(editFieldsNew);
        setEditorOpen(true);
    };
    // Hooks
    useEffect(() => {
        // Component dismount hook to clean the state's response error
        return () => {
            setCenterCycle(false);
            dispatch(setClearStateResponse());
        };
    }, []);
    useEffect(() => {
        if (!trackingProductsResponse?.error?.message?.length) {
            return;
        }

        CommonMessageSend(dispatch, trackingProductsResponse?.error as CommonError,);
    }, [trackingProductsResponse?.error]);
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
            HaveError(trackingProductsResponse?.error) ||
            QueryParamsCompareToQueryParamsApi(
                getQueryParams,
                trackingProductsResponse.meta?.query_params as QueryParamsApiType,
            )
        ) {
            return;
        }

        if (id2UseNum) {
            const id2Use: number = id2UseNum;

            setId2UseNum(0);
            setGlobalFilter(`${KLedgerIdSearchTokenPrefix}${id2Use}${KLedgerIdSearchTokenSuffix}`);
            setLastId(id2Use);
            setShowOnMap(true);
        } else {
            fetch();
        }
    }, [doLoad, getQueryParams]);
    useEffect(() => {
        if (!lastId) {
            return;
        }

        if (showOnMap) {
            setShowOnMap(false);
            setHistoryTabIndex(historyTabIndex);
            report(null, lastId);
        } else if (keepEditorOpen) {
            fetchReportRows(lastId);
        }
    }, [lastId, showOnMap, keepEditorOpen]);
    useEffect(() => {
        if (getQueryParams?.globalFilter?.includes(KLedgerIdSearchTokenPrefix) && trackingProductsResponse?.data?.length) {
            bookmark(trackingProductsResponse.data[0] ?? null);
        }
    }, [getQueryParams?.globalFilter, trackingProductsResponse?.data?.length]);
    useEffect(() => {
        if (
            !keepEditorOpen ||
            !lastId ||
            !trackingProductsResponse?.data?.length
        ) {
            return;
        }

        const rowToUse: TrackingProductsType | undefined =
            trackingProductsResponse.data.find(
                d => d.tracking_products_ledger_id === lastId,
            );

        if (rowToUse) {
            contentEdit(rowToUse);
        }
    }, [keepEditorOpen, lastId, trackingProductsResponse]);
    useEffect(() => {
        if (isEditorOpen || isModalOpenTrackingProductsHistory) {
            if (trackingProductsResponse?.reportData?.length) {
                bookmark(trackingProductsResponse?.reportData[0]);
            }
        } else {
            bookmark(null);
        }
    }, [isModalOpenTrackingProductsHistory, trackingProductsResponse?.reportData]);
    useEffect(() => {
        setHelperCenterIdx(centerIdx);
    }, [centerIdx]);
    useEffect(() => {
        if (helperCenterIdx !== centerIdx) {
            setCenterIdx(helperCenterIdx);
        }
    }, [helperCenterIdx]);
    useEffect(() => {
        if (centerCycle && centerCount) {
            setCenterIdx((helperCenterIdx + 1) % (centerCount + 1));
            setPlay(
                setInterval(() => {
                    setHelperCenterIdx(
                        helperCenterIdx =>
                            (helperCenterIdx + 1) % (centerCount + 1),
                    );
                }, 3000),
            );
        } else if (!centerCycle && play) {
            clearInterval(play);
            setPlay(null);
        }
    }, [centerCycle, centerCount]);

    return (
        <>
            <FvTrackingProductsModalAll
                isClean={isClean}
                reportTrackingProducts={report}
                upsertTrackingProducts={upsert}
                editFields={editFields}
                setEditFields={setEditFields}
            />

            <Box className={styles.row}>
                <FvDataGrid
                    icon={iconTrackingProducts}
                    label={KLabelTrackingProducts}
                    modalMode={modalMode}
                    readOnly={readOnly || ((assumedAccessMask ?? 0) & (KRoleGlobalOwner | KRoleSupplyChainOwner)) === 0 ? true : false}
                    columns={columns}
                    columnFilters={columnFilters}
                    queryResponse={trackingProductsResponse}
                    includeDetails={includeDetails}
                    globalFilter={globalFilter}
                    isLoading={isLoading}
                    pagination={pagination}
                    sorting={sorting}
                    contentCreate={() => contentEdit()}
                    contentEdit={row => contentEdit(row)}
                    fetch={fetch}
                    report={report}
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
