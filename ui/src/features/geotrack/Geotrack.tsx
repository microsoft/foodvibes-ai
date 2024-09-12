import { useAppDispatch, useAppSelector } from "@foodvibes/app/hooks";
import styles from "@foodvibes/components/FvCommon.module.css";
import FvDataGrid from "@foodvibes/components/FvDataGrid";
import {
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState,
} from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import { useMsal } from "@azure/msal-react";
import {
    actionSetEditFields,
    actionSetEditorOpen2,
    actionSetModalOpenTrackingProductsReadOnly,
    actionUploadImage,
    actionUploadedFileUrlReset,
    selectAccessToken,
    selectAssumedAccessMask,
    selectAssumedUsername,
    selectBookmarkedGeotrack,
    selectEditFields,
    selectEditorOpen2,
    selectIsClean,
    selectMapsEngineIsReady,
    selectModalOpenTrackingProductsReadOnly,
    selectUploadedFileUrl
} from "@foodvibes/app/mainSlice";
import iconGeotrack from "@foodvibes/assets/geotrack.png";
import { FvGeotrackModalEdit } from "@foodvibes/features/commonModals/FvGeotrackModalEdit";
import { FvTrackingProductsLookupModal } from "@foodvibes/features/commonModals/FvTrackingProductsLookupModal";
import { actionSelectTrackingProducts, actionSetCenterCycle } from "@foodvibes/features/trackingProducts/trackingProductsSlice";
import { KLabelGeotrack, KLedgerIdSearchTokenPrefix, KLedgerIdSearchTokenSuffix, KRoleGeotrackOwner, KRoleGlobalOwner, KRoleSupplyChainOwner } from "@foodvibes/utils/commonConstants";
import {
    BookmarkGeotrack,
    NowTimestamp,
    QueryParamsCompareToQueryParams,
    QueryParamsCompareToQueryParamsApi,
    QueryParamsInit
} from "@foodvibes/utils/commonFunctions";
import {
    default as CommonMessageSend,
    default as commonMessageSend,
} from "@foodvibes/utils/commonMessageSend";
import {
    CommonError,
    EditFieldsType,
    GeotrackPutType,
    GeotrackType,
    QueryParamsApiType,
    QueryParamsType,
    QueryResponseType,
    UploadImageType
} from "@foodvibes/utils/commonTypes";
import { Box } from "@mui/material";
import { useMatches } from "react-router";
import { geotrackColumns } from "./geotrackColumns";
import {
    actionSelectGeotrack,
    actionSetLastId,
    actionSetQueryParams,
    actionUpsertGeotrack,
    selectGeotrackIsLoading,
    selectGeotrackResponse,
    selectGetQueryParams,
    selectLastIdGeotrack,
    setClearStateResponse,
} from "./geotrackSlice";

export const Geotrack = ({
    modalMode,
    readOnly,
    postBookmarkCb,
}: {
    modalMode?: boolean | null;
    readOnly?: boolean | null;
    postBookmarkCb?: (row: GeotrackType | null) => void;
}) => {
    const matches = useMatches();
    const id2Use = matches[matches.length - 1].params["id"];
    const { instance } = useMsal();
    const dispatch = useAppDispatch();
    const accessToken: string | null = useAppSelector(selectAccessToken);
    const assumedUsername: string | null = useAppSelector(selectAssumedUsername);
    const assumedAccessMask: number | null = useAppSelector(selectAssumedAccessMask);
    const isLoading: boolean = useAppSelector(selectGeotrackIsLoading);
    const getQueryParams: QueryParamsType = useAppSelector(selectGetQueryParams);
    const setQueryParams = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParams(payload));
    const lastId: number = useAppSelector(selectLastIdGeotrack);
    const geotrackResponse: QueryResponseType<GeotrackType> = useAppSelector(selectGeotrackResponse,);
    const bookmarkedGeotrack: GeotrackType | null = useAppSelector(selectBookmarkedGeotrack);
    const uploadedFileUrl: string | null = useAppSelector(selectUploadedFileUrl,);
    const isClean: boolean | null = useAppSelector(selectIsClean);
    const isModalOpenTrackingProductsReadOnly: boolean = useAppSelector(selectModalOpenTrackingProductsReadOnly) ?? false;
    const mapsEngineIsReady: boolean | null = useAppSelector(selectMapsEngineIsReady,);
    const setCenterCycle = (on: boolean) => dispatch(actionSetCenterCycle(on));
    const setLastId = (lastId: number) => dispatch(actionSetLastId(lastId));
    const setModalOpenTrackingProductsReadOnly = (payload: boolean) => dispatch(actionSetModalOpenTrackingProductsReadOnly(payload));
    const setEditorOpen = (payload: boolean) => dispatch(actionSetEditorOpen2(payload));
    const uploadedFileUrlReset = () => dispatch(actionUploadedFileUrlReset());
    const uploadImage = (uploadImage: UploadImageType) => dispatch(actionUploadImage({ uploadImage, accessToken }));
    const editFields: EditFieldsType | null = useAppSelector(selectEditFields);
    const setEditFields = (payload: EditFieldsType | null) => dispatch(actionSetEditFields(payload));
    const selectGeotrack = (queryParams: QueryParamsType) => dispatch(actionSelectGeotrack({
        queryParams: {
            ...queryParams,
            impersonatedUser: assumedUsername ?? "",
        }, accessToken, instance,
    }));
    const selectTrackingProducts = (queryParams: QueryParamsType) => dispatch(actionSelectTrackingProducts({
        queryParams: {
            ...queryParams,
            impersonatedUser: assumedUsername ?? "",
        }, accessToken, instance,
    }));
    const upsertGeotrack = (queryParams: QueryParamsType, rowToUpsert: GeotrackPutType) => dispatch(actionUpsertGeotrack({
        queryParams: {
            ...queryParams,
            impersonatedUser: assumedUsername ?? "",
        },
        rowToUpsert,
        accessToken,
        instance
    }));
    const [doLoad, setDoLoad] = useState<boolean>(false);
    const [showLinks, setShowLinks] = useState<boolean>(false);
    const [id2UseNum, setId2UseNum] = useState<number>(0);
    const [keepEditorOpen, setKeepEditorOpen] = useState<boolean>(false);
    const isEditorOpen: boolean = useAppSelector(selectEditorOpen2) ?? false;
    const [includeDetails, setIncludeDetails] = useState<boolean>(getQueryParams?.includeDetails,);
    const [globalFilter, setGlobalFilter] = useState<string>(getQueryParams?.globalFilter,);
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(getQueryParams?.columnFilters,);
    const [sorting, setSorting] = useState<MRT_SortingState>(getQueryParams?.sorting,);
    const [pagination, setPagination] = useState<MRT_PaginationState>(getQueryParams?.pagination,);

    const columns = useMemo<MRT_ColumnDef<GeotrackType>[]>(
        () => geotrackColumns(),
        [],
    );
    const fetch = async (ledgerId?: number) => {
        await selectGeotrack(
            QueryParamsInit(getQueryParams)
        );
    };
    const fetchReportRows = async (ledgerId: number) => {
        await selectTrackingProducts(
            QueryParamsInit({
                includeDetails: true,
                columnFilters: [
                    {
                        id: "geotrack_ledger_id",
                        value: ledgerId,
                    },
                ],
            }),
        );
    };
    const bookmark = async (row: GeotrackType | null) => {
        BookmarkGeotrack(dispatch, row);

        if (postBookmarkCb) {
            postBookmarkCb(row);
        }
    };
    const reportSub = async (ledgerId: number) => {
        await fetchReportRows(ledgerId);
    };
    const report = async (
        row: GeotrackType | null,
        ledgerId?: number,
    ) => {
        const id2Use: number =
            row?.geotrack_ledger_id ?? ledgerId ?? 0;

        if (id2Use) {
            await reportSub(id2Use);
            bookmark(row);
            setModalOpenTrackingProductsReadOnly(true);
        }
    };
    const upsert = async (keepEditorOpenNew: boolean, saveAsNew?: boolean) => {
        const ledger_id: number = saveAsNew ? 0 : editFields?.incoming?.geotrack_ledger_id ?? 0;
        const geotrack_id = editFields?.incoming?.geotrack_id ?? "";
        const details = editFields?.incoming?.details ?? "";
        const image_id = editFields?.incoming?.image_id ?? "";
        const latitude = editFields?.incoming?.latitude ?? 0;
        const longitude = editFields?.incoming?.longitude ?? 0;
        const name = editFields?.incoming?.name ?? "";
        const properties: string = editFields?.incoming?.properties ?? "";
        const recorded_at = editFields?.incoming?.recorded_at ?? "";
        const username = editFields?.incoming?.username ?? "";
        const rowToUpsert: GeotrackPutType = {
            details,
            geotrack_id,
            image_id,
            ledger_id,
            latitude,
            longitude,
            name,
            recorded_at,
            properties,
            username,
        };
        await upsertGeotrack(QueryParamsInit(getQueryParams), rowToUpsert);
        setKeepEditorOpen(keepEditorOpenNew);

        if (!keepEditorOpenNew) {
            bookmark(null);
            setEditFields(null);
            setEditorOpen(false);
        }
    };
    const contentEdit = (row?: GeotrackType): void => {
        setLastId(0);
        setEditFields(null);

        const editFieldsNew: EditFieldsType = {
            current: {},
            incoming: {},
        };

        if (row) {
            bookmark({ ...row });

            editFieldsNew.current = {
                geotrack_ledger_id: row.geotrack_ledger_id,
                geotrack_id: row.geotrack_id,
                details: row.details,
                name: row.name,
                latitude: row.latitude,
                longitude: row.longitude,
                image_id: row.image_id,
                image_url: row.image_url,
                properties: row.properties,
                recorded_at: row.recorded_at,
            };
        } else {
            reportSub(0);
            bookmark(null);

            editFieldsNew.current = {
                geotrack_ledger_id: 0,
            };
        }

        editFieldsNew.incoming = {
            ...editFieldsNew.current,
            image_id: editFieldsNew.current?.image_id ?? `geotrack/${uuidv4()}`,
            recorded_at: editFieldsNew.current?.recorded_at ?? NowTimestamp(),
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
        if (!geotrackResponse?.error?.message?.length) {
            return;
        }

        CommonMessageSend(dispatch, geotrackResponse?.error as CommonError);
    }, [geotrackResponse?.error]);
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
            reportMode: getQueryParams?.reportMode,
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
            QueryParamsCompareToQueryParamsApi(
                getQueryParams,
                geotrackResponse.meta?.query_params as QueryParamsApiType,
            )
        ) {
            return;
        }

        if (id2UseNum) {
            const id2Use: number = id2UseNum;

            setId2UseNum(0);
            setGlobalFilter(`${KLedgerIdSearchTokenPrefix}${id2Use}${KLedgerIdSearchTokenSuffix}`);
            setLastId(id2Use);
            setShowLinks(true);
        } else {
            fetch();
        }
    }, [doLoad, getQueryParams]);
    useEffect(() => {
        if (!lastId || !showLinks) {
            return;
        }

        setShowLinks(false);
        report(null, lastId);
    }, [lastId, showLinks]);
    useEffect(() => {
        if (getQueryParams?.globalFilter?.includes(KLedgerIdSearchTokenPrefix) && geotrackResponse?.data?.length) {
            bookmark(geotrackResponse.data[0] ?? null);
        }
    }, [getQueryParams?.globalFilter, geotrackResponse?.data?.length]);
    useEffect(() => {
        if (
            !keepEditorOpen ||
            !lastId ||
            !geotrackResponse?.data?.length
        ) {
            return;
        }

        const rowToUse: GeotrackType | undefined =
            geotrackResponse.data.find(
                d => d.geotrack_ledger_id === lastId,
            );

        if (rowToUse) {
            contentEdit(rowToUse);
        }
    }, [keepEditorOpen, lastId, geotrackResponse]);

    return (
        <>
            <FvTrackingProductsLookupModal
                selectTrackingProducts={selectTrackingProducts}
                label={KLabelGeotrack}
                title={bookmarkedGeotrack?.geotrack_id ?? '--'}
                ledgerId={bookmarkedGeotrack?.geotrack_ledger_id ?? 0}
                isModalOpenTrackingProductsHistory={isModalOpenTrackingProductsReadOnly}
                setModalOpenTrackingProductsHistory={setModalOpenTrackingProductsReadOnly}
                setCenterCycle={setCenterCycle}
                setLastId={setLastId}
            />

            <FvGeotrackModalEdit
                bookmarkedGeotrack={bookmarkedGeotrack}
                editFields={editFields}
                setEditFields={setEditFields}
                isClean={isClean}
                isEditorOpen={isEditorOpen}
                mapsEngineIsReady={mapsEngineIsReady}
                uploadedFileUrl={uploadedFileUrl}
                setEditorOpen={setEditorOpen}
                upsert={upsert}
                uploadedFileUrlReset={uploadedFileUrlReset}
                uploadImage={uploadImage}
            />

            <Box className={styles.row}>
                <FvDataGrid
                    icon={iconGeotrack}
                    label={KLabelGeotrack}
                    modalMode={modalMode}
                    readOnly={readOnly || ((assumedAccessMask ?? 0) & (KRoleGlobalOwner | KRoleSupplyChainOwner | KRoleGeotrackOwner)) === 0 ? true : false}
                    columns={columns}
                    columnFilters={columnFilters}
                    queryResponse={geotrackResponse}
                    includeDetails={includeDetails}
                    globalFilter={globalFilter}
                    isLoading={isLoading}
                    pagination={pagination}
                    sorting={sorting}
                    bookmark={postBookmarkCb ? bookmark : null}
                    contentCreate={() => contentEdit()}
                    contentEdit={row => contentEdit(row)}
                    fetch={fetch}
                    links={modalMode ? null : report}
                    setIncludeDetails={setIncludeDetails}
                    setColumnFilters={setColumnFilters}
                    setGlobalFilter={setGlobalFilter}
                    setPagination={setPagination}
                    setSorting={setSorting}
                    setMessage={(message?: string) => {
                        commonMessageSend(dispatch, { message } as CommonError);
                    }}
                />
            </Box>
        </>
    );
};
