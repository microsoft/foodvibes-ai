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
    selectBookmarkedProduct,
    selectEditFields,
    selectEditorOpen2,
    selectIsClean,
    selectModalOpenTrackingProductsReadOnly,
    selectUploadedFileUrl
} from "@foodvibes/app/mainSlice";
import iconProduct from "@foodvibes/assets/product.png";
import { FvProductModalEdit } from "@foodvibes/features/commonModals/FvProductModalEdit";
import { FvTrackingProductsLookupModal } from "@foodvibes/features/commonModals/FvTrackingProductsLookupModal";
import { actionSelectTrackingProducts, actionSetCenterCycle } from "@foodvibes/features/trackingProducts/trackingProductsSlice";
import { KLabelProduct, KLedgerIdSearchTokenPrefix, KLedgerIdSearchTokenSuffix, KRoleGlobalOwner, KRoleProductOwner, KRoleSupplyChainOwner } from "@foodvibes/utils/commonConstants";
import {
    BookmarkProduct,
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
    ProductPutType,
    ProductType,
    QueryParamsApiType,
    QueryParamsType,
    QueryResponseType,
    UploadImageType
} from "@foodvibes/utils/commonTypes";
import { Box } from "@mui/material";
import { useMatches } from "react-router";
import { productColumns } from "./productColumns";
import {
    actionSelectProduct,
    actionSetLastId,
    actionSetQueryParams,
    actionUpsertProduct,
    selectGetQueryParams,
    selectLastIdProduct,
    selectProductIsLoading,
    selectProductResponse,
    setClearStateResponse,
} from "./productSlice";

export const Product = ({
    modalMode,
    readOnly,
    postBookmarkCb,
}: {
    modalMode?: boolean | null;
    readOnly?: boolean | null;
    postBookmarkCb?: (row: ProductType | null) => void;
}) => {
    const matches = useMatches();
    const id2Use = matches[matches.length - 1].params["id"];
    const { instance } = useMsal();
    const dispatch = useAppDispatch();
    const accessToken: string | null = useAppSelector(selectAccessToken);
    const assumedUsername: string | null = useAppSelector(selectAssumedUsername);
    const assumedAccessMask: number | null = useAppSelector(selectAssumedAccessMask);
    const isLoading: boolean = useAppSelector(selectProductIsLoading);
    const getQueryParams: QueryParamsType = useAppSelector(selectGetQueryParams);
    const setQueryParams = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParams(payload));
    const lastId: number = useAppSelector(selectLastIdProduct);
    const productResponse: QueryResponseType<ProductType> = useAppSelector(selectProductResponse,);
    const bookmarkedProduct: ProductType | null = useAppSelector(selectBookmarkedProduct,);
    const uploadedFileUrl: string | null = useAppSelector(selectUploadedFileUrl,);
    const isClean: boolean | null = useAppSelector(selectIsClean);
    const isModalOpenTrackingProductsReadOnly: boolean = useAppSelector(selectModalOpenTrackingProductsReadOnly) ?? false;
    const setCenterCycle = (on: boolean) => dispatch(actionSetCenterCycle(on));
    const setLastId = (lastId: number) => dispatch(actionSetLastId(lastId));
    const setModalOpenTrackingProductsReadOnly = (payload: boolean) => dispatch(actionSetModalOpenTrackingProductsReadOnly(payload));
    const setEditorOpen = (payload: boolean) => dispatch(actionSetEditorOpen2(payload));
    const uploadedFileUrlReset = () => dispatch(actionUploadedFileUrlReset());
    const uploadImage = (uploadImage: UploadImageType) => dispatch(actionUploadImage({ uploadImage, accessToken }));
    const editFields: EditFieldsType | null = useAppSelector(selectEditFields);
    const setEditFields = (payload: EditFieldsType | null) => dispatch(actionSetEditFields(payload));
    const selectProduct = (queryParams: QueryParamsType) => dispatch(actionSelectProduct({
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
    const upsertProduct = (queryParams: QueryParamsType, rowToUpsert: ProductPutType) => dispatch(actionUpsertProduct({
        queryParams: {
            ...queryParams,
            impersonatedUser: assumedUsername ?? "",
        }, rowToUpsert, accessToken, instance
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

    const columns = useMemo<MRT_ColumnDef<ProductType>[]>(
        () => productColumns(),
        [],
    );
    const fetch = async () => {
        await selectProduct(QueryParamsInit(getQueryParams));
    };
    const fetchReportRows = async (ledgerId: number) => {
        await selectTrackingProducts(
            QueryParamsInit({
                includeDetails: true,
                columnFilters: [
                    {
                        id: "product_ledger_id",
                        value: ledgerId,
                    },
                ],
            }),
        );
    };
    const bookmark = async (row: ProductType | null) => {
        BookmarkProduct(dispatch, row);

        if (postBookmarkCb) {
            postBookmarkCb(row);
        }
    };
    const reportSub = async (ledgerId: number) => {
        await fetchReportRows(ledgerId);
    };
    const report = async (
        row: ProductType | null,
        ledgerId?: number,
    ) => {
        const id2Use: number =
            row?.product_ledger_id ?? ledgerId ?? 0;

        if (id2Use) {
            await reportSub(id2Use);
            bookmark(row);
            setModalOpenTrackingProductsReadOnly(true);
        }
    };
    const upsert = async (keepEditorOpenNew: boolean, saveAsNew?: boolean) => {
        const ledger_id: number = saveAsNew ? 0 : editFields?.incoming?.product_ledger_id ?? 0;
        const product_id = editFields?.incoming?.product_id ?? "";
        const description = editFields?.incoming?.description ?? "";
        const image_id = editFields?.incoming?.image_id ?? "";
        const properties: string = editFields?.incoming?.properties ?? "";
        const quantity = editFields?.incoming?.quantity ?? 0;
        const recorded_at = editFields?.incoming?.recorded_at ?? "";
        const storage_tier = editFields?.incoming?.storage_tier ?? 0;
        const username = editFields?.incoming?.username ?? "";
        const rowToUpsert: ProductPutType = {
            description,
            image_id,
            ledger_id,
            product_id,
            properties,
            quantity,
            recorded_at,
            storage_tier,
            username,
        };
        await upsertProduct(QueryParamsInit(getQueryParams), rowToUpsert);
        setKeepEditorOpen(keepEditorOpenNew);

        if (!keepEditorOpenNew) {
            bookmark(null);
            setEditFields(null);
            setEditorOpen(false);
        }
    };
    const contentEdit = (row?: ProductType): void => {
        setLastId(0);
        setEditFields(null);

        const editFieldsNew: EditFieldsType = {
            current: {},
            incoming: {},
        };

        if (row) {
            bookmark({ ...row });

            editFieldsNew.current = {
                product_ledger_id: row.product_ledger_id,
                product_id: row.product_id,
                description: row.description,
                quantity: row.quantity,
                storage_tier: row.storage_tier,
                image_id: row.image_id,
                image_url: row.image_url,
                properties: row.properties,
                recorded_at: row.recorded_at,
            };
        } else {
            reportSub(0);
            bookmark(null);

            editFieldsNew.current = {
                product_ledger_id: 0,
            };
        }

        editFieldsNew.incoming = {
            ...editFieldsNew.current,
            image_id: editFieldsNew.current?.image_id ?? `product/${uuidv4()}`,
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
        if (!productResponse?.error?.message?.length) {
            return;
        }

        CommonMessageSend(dispatch, productResponse?.error as CommonError);
    }, [productResponse?.error]);
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
                productResponse.meta?.query_params as QueryParamsApiType,
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
        if (getQueryParams?.globalFilter?.includes(KLedgerIdSearchTokenPrefix) && productResponse?.data?.length) {
            bookmark(productResponse.data[0] ?? null);
        }
    }, [getQueryParams?.globalFilter, productResponse?.data?.length]);
    useEffect(() => {
        if (
            !keepEditorOpen ||
            !lastId ||
            !productResponse?.data?.length
        ) {
            return;
        }

        const rowToUse: ProductType | undefined =
            productResponse.data.find(
                d => d.product_ledger_id === lastId,
            );

        if (rowToUse) {
            contentEdit(rowToUse);
        }
    }, [keepEditorOpen, lastId, productResponse]);

    return (
        <>
            <FvTrackingProductsLookupModal
                selectTrackingProducts={selectTrackingProducts}
                label={KLabelProduct}
                title={bookmarkedProduct?.product_id ?? '--'}
                ledgerId={bookmarkedProduct?.product_ledger_id ?? 0}
                isModalOpenTrackingProductsHistory={isModalOpenTrackingProductsReadOnly}
                setModalOpenTrackingProductsHistory={setModalOpenTrackingProductsReadOnly}
                setCenterCycle={setCenterCycle}
                setLastId={setLastId}
            />

            <FvProductModalEdit
                bookmarkedProduct={bookmarkedProduct}
                editFields={editFields}
                setEditFields={setEditFields}
                isClean={isClean}
                isEditorOpen={isEditorOpen}
                uploadedFileUrl={uploadedFileUrl}
                setEditorOpen={setEditorOpen}
                upsert={upsert}
                uploadedFileUrlReset={uploadedFileUrlReset}
                uploadImage={uploadImage}
            />

            <Box className={styles.row}>
                <FvDataGrid
                    icon={iconProduct}
                    label={KLabelProduct}
                    modalMode={modalMode}
                    readOnly={readOnly || ((assumedAccessMask ?? 0) & (KRoleGlobalOwner | KRoleSupplyChainOwner | KRoleProductOwner)) === 0 ? true : false}
                    columns={columns}
                    columnFilters={columnFilters}
                    queryResponse={productResponse}
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
