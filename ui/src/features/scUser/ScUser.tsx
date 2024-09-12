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

import { useMsal } from "@azure/msal-react";
import {
    actionSetEditFields,
    actionSetEditorOpen2,
    actionUploadImage,
    actionUploadedFileUrlReset,
    selectAccessToken,
    selectAssumedAccessMask,
    selectAssumedUsername,
    selectBookmarkedScUser,
    selectEditFields,
    selectEditorOpen2,
    selectIsClean,
    selectUploadedFileUrl
} from "@foodvibes/app/mainSlice";
import iconScUser from "@foodvibes/assets/sc_user.png";
import { FvIdNoAccessMessage } from "@foodvibes/components/FvIdNoAccessMessage";
import { FvScUserModalEdit } from "@foodvibes/features/commonModals/FvScUserModalEdit";
import { KLabelScUser, KLedgerIdSearchTokenPrefix, KLedgerIdSearchTokenSuffix, KMenuLabelUserManagement } from "@foodvibes/utils/commonConstants";
import {
    BookmarkScUser,
    QueryParamsCompareToQueryParams,
    QueryParamsCompareToQueryParamsApi,
    QueryParamsInit
} from "@foodvibes/utils/commonFunctions";
import { MenuItems } from "@foodvibes/utils/commonLookups";
import {
    default as CommonMessageSend,
    default as commonMessageSend,
} from "@foodvibes/utils/commonMessageSend";
import {
    CommonError,
    EditFieldsType,
    MenuItemType,
    QueryParamsApiType,
    QueryParamsType,
    QueryResponseType,
    ScUserPutType,
    ScUserType,
    UploadImageType
} from "@foodvibes/utils/commonTypes";
import { Box } from "@mui/material";
import { useMatches } from "react-router";
import { scUserColumns } from "./scUserColumns";
import {
    actionSelectScUser,
    actionSetLastId,
    actionSetQueryParams,
    actionUpsertScUser,
    selectGetQueryParams,
    selectLastIdScUser,
    selectScUserIsLoading,
    selectScUserResponse,
    setClearStateResponse
} from "./scUserSlice";

export const ScUser = ({
    modalMode,
    readOnly,
    postBookmarkCb,
}: {
    modalMode?: boolean | null;
    readOnly?: boolean | null;
    postBookmarkCb?: (row: ScUserType | null) => void;
}) => {
    const matches = useMatches();
    const id2Use = matches[matches.length - 1].params["id"];
    const { instance } = useMsal();
    const dispatch = useAppDispatch();
    const accessToken: string | null = useAppSelector(selectAccessToken);
    const assumedUsername: string | null = useAppSelector(selectAssumedUsername);
    const assumedAccessMask: number | null = useAppSelector(selectAssumedAccessMask);
    const isLoading: boolean | undefined = useAppSelector(selectScUserIsLoading);
    const getQueryParams: QueryParamsType = useAppSelector(selectGetQueryParams);
    const setQueryParams = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParams(payload));
    const lastId: number = useAppSelector(selectLastIdScUser);
    const scUserResponse: QueryResponseType<ScUserType> = useAppSelector(selectScUserResponse,);
    const bookmarkedScUser: ScUserType | null = useAppSelector(selectBookmarkedScUser,);
    const uploadedFileUrl: string | null = useAppSelector(selectUploadedFileUrl,);
    const isClean: boolean | null = useAppSelector(selectIsClean);
    const setLastId = (lastId: number) => dispatch(actionSetLastId(lastId));
    const setEditorOpen = (payload: boolean) => dispatch(actionSetEditorOpen2(payload));
    const uploadedFileUrlReset = () => dispatch(actionUploadedFileUrlReset());
    const uploadImage = (uploadImage: UploadImageType) => dispatch(actionUploadImage({ uploadImage, accessToken }));
    const editFields: EditFieldsType | null = useAppSelector(selectEditFields);
    const setEditFields = (payload: EditFieldsType | null) => dispatch(actionSetEditFields(payload));
    const selectScUser = (queryParams: QueryParamsType) => dispatch(actionSelectScUser({
        queryParams: {
            ...queryParams,
            impersonatedUser: assumedUsername ?? "",
        }, accessToken, instance,
    }));
    const upsertScUser = (queryParams: QueryParamsType, rowToUpsert: ScUserPutType) => dispatch(actionUpsertScUser({
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

    const columns = useMemo<MRT_ColumnDef<ScUserType>[]>(
        () => scUserColumns(),
        [],
    );
    const menuItem: MenuItemType | undefined = useMemo<MenuItemType | undefined>(() => MenuItems.find(
        e => e.label === KMenuLabelUserManagement && (assumedAccessMask ?? 0) & e.accessMask), [assumedAccessMask]);
    const fetch = async () => {
        await selectScUser(QueryParamsInit(getQueryParams));
    };
    const bookmark = async (row: ScUserType | null) => {
        BookmarkScUser(dispatch, row);

        if (postBookmarkCb) {
            postBookmarkCb(row);
        }
    };
    const upsert = async (keepEditorOpenNew: boolean, saveAsNew?: boolean) => {
        const ledger_id: number = saveAsNew ? 0 : editFields?.incoming?.sc_user_ledger_id ?? 0;
        const sc_user_id = editFields?.incoming?.sc_user_id ?? "";
        const email_addr = editFields?.incoming?.email_addr ?? "";
        const phone = editFields?.incoming?.phone ?? "";
        const access_mask = editFields?.incoming?.access_mask ?? 0;
        const deleted = editFields?.incoming?.deleted ?? false;
        const username = editFields?.incoming?.username ?? "";
        const rowToUpsert: ScUserPutType = {
            ledger_id,
            sc_user_id,
            email_addr,
            phone,
            access_mask,
            deleted,
            username,
        };
        await upsertScUser(QueryParamsInit(getQueryParams), rowToUpsert);
        setKeepEditorOpen(keepEditorOpenNew);

        if (!keepEditorOpenNew) {
            bookmark(null);
            setEditFields(null);
            setEditorOpen(false);
        }
    };
    const contentEdit = (row?: ScUserType): void => {
        setLastId(0);
        setEditFields(null);

        const editFieldsNew: EditFieldsType = {
            current: {},
            incoming: {},
        };

        if (row) {
            bookmark({ ...row });

            editFieldsNew.current = {
                sc_user_ledger_id: row.sc_user_ledger_id,
                sc_user_id: row.sc_user_id,
                email_addr: row.email_addr,
                phone: row.phone,
                access_mask: row.access_mask,
            };
        } else {
            bookmark(null);

            editFieldsNew.current = {
                sc_user_ledger_id: 0,
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
        if (!scUserResponse?.error?.message?.length) {
            return;
        }

        CommonMessageSend(dispatch, scUserResponse?.error as CommonError);
    }, [scUserResponse?.error]);
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
                scUserResponse.meta?.query_params as QueryParamsApiType,
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
    }, [lastId, showLinks]);
    useEffect(() => {
        if (getQueryParams?.globalFilter?.includes(KLedgerIdSearchTokenPrefix) && scUserResponse?.data?.length) {
            bookmark(scUserResponse.data[0] ?? null);
        }
    }, [getQueryParams?.globalFilter, scUserResponse?.data?.length]);
    useEffect(() => {
        if (
            !keepEditorOpen ||
            !lastId ||
            !scUserResponse?.data?.length
        ) {
            return;
        }

        const rowToUse: ScUserType | undefined =
            scUserResponse.data.find(
                d => d.sc_user_ledger_id === lastId,
            );

        if (rowToUse) {
            contentEdit(rowToUse);
        }
    }, [keepEditorOpen, lastId, scUserResponse]);

    return !menuItem ? <FvIdNoAccessMessage /> : (
        <>
            <FvScUserModalEdit
                bookmarkedScUser={bookmarkedScUser}
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
                    icon={iconScUser}
                    label={KLabelScUser}
                    modalMode={modalMode}
                    readOnly={readOnly}
                    columns={columns}
                    columnFilters={columnFilters}
                    queryResponse={scUserResponse}
                    includeDetails={includeDetails}
                    globalFilter={globalFilter}
                    isLoading={isLoading}
                    pagination={pagination}
                    sorting={sorting}
                    bookmark={postBookmarkCb ? bookmark : null}
                    contentCreate={() => contentEdit()}
                    contentEdit={row => contentEdit(row)}
                    fetch={fetch}
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
