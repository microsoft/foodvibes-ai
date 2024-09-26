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
    selectBookmarkedScGroup,
    selectEditFields,
    selectEditorOpen2,
    selectIsClean,
    selectUploadedFileUrl
} from "@foodvibes/app/mainSlice";
import iconScGroup from "@foodvibes/assets/sc_group.png";
import { FvIdNoAccessMessage } from "@foodvibes/components/FvIdNoAccessMessage";
import { FvScGroupModalEdit } from "@foodvibes/features/commonModals/FvScGroupModalEdit";
import { KLabelScGroup, KLedgerIdSearchTokenPrefix, KLedgerIdSearchTokenSuffix, KMenuLabelGroupManagement } from "@foodvibes/utils/commonConstants";
import {
    BookmarkScGroup,
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
    ScGroupPutType,
    ScGroupType,
    UploadImageType
} from "@foodvibes/utils/commonTypes";
import { Box } from "@mui/material";
import { useMatches } from "react-router";
import { scGroupColumns } from "./scGroupColumns";
import {
    actionSelectScGroup,
    actionSetLastId,
    actionSetQueryParams,
    actionUpsertScGroup,
    selectGetQueryParams,
    selectLastIdScGroup,
    selectScGroupIsLoading,
    selectScGroupResponse,
    setClearStateResponse,
} from "./scGroupSlice";

export const ScGroup = ({
    modalMode,
    readOnly,
    postBookmarkCb,
}: {
    modalMode?: boolean | null;
    readOnly?: boolean | null;
    postBookmarkCb?: (row: ScGroupType | null) => void;
}) => {
    const matches = useMatches();
    const id2Use = matches[matches.length - 1].params["id"];
    const { instance } = useMsal();
    const dispatch = useAppDispatch();
    const accessToken: string | null = useAppSelector(selectAccessToken);
    const assumedUsername: string | null = useAppSelector(selectAssumedUsername);
    const assumedAccessMask: number | null = useAppSelector(selectAssumedAccessMask);
    const isLoading: boolean = useAppSelector(selectScGroupIsLoading);
    const getQueryParams: QueryParamsType = useAppSelector(selectGetQueryParams);
    const setQueryParams = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParams(payload));
    const lastId: number = useAppSelector(selectLastIdScGroup);
    const scGroupResponse: QueryResponseType<ScGroupType> = useAppSelector(selectScGroupResponse,);
    const bookmarkedScGroup: ScGroupType | null = useAppSelector(selectBookmarkedScGroup,);
    const uploadedFileUrl: string | null = useAppSelector(selectUploadedFileUrl,);
    const isClean: boolean | null = useAppSelector(selectIsClean);
    const setLastId = (lastId: number) => dispatch(actionSetLastId(lastId));
    const setEditorOpen = (payload: boolean) => dispatch(actionSetEditorOpen2(payload));
    const uploadedFileUrlReset = () => dispatch(actionUploadedFileUrlReset());
    const uploadImage = (uploadImage: UploadImageType) => dispatch(actionUploadImage({ uploadImage, accessToken }));
    const editFields: EditFieldsType | null = useAppSelector(selectEditFields);
    const setEditFields = (payload: EditFieldsType | null) => dispatch(actionSetEditFields(payload));
    const selectScGroup = (queryParams: QueryParamsType) => dispatch(actionSelectScGroup({
        queryParams: {
            ...queryParams,
            impersonatedUser: assumedUsername ?? "",
        }, accessToken, instance,
    }));
    const upsertScGroup = (queryParams: QueryParamsType, rowToUpsert: ScGroupPutType) => dispatch(actionUpsertScGroup({
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

    const columns = useMemo<MRT_ColumnDef<ScGroupType>[]>(
        () => scGroupColumns(),
        [],
    );
    const menuItem: MenuItemType | undefined = useMemo<MenuItemType | undefined>(() => MenuItems.find(
        e => e.label === KMenuLabelGroupManagement && (assumedAccessMask ?? 0) & e.accessMask), [assumedAccessMask]);
    const fetch = async () => {
        await selectScGroup(QueryParamsInit(getQueryParams));
    };
    const bookmark = async (row: ScGroupType | null) => {
        BookmarkScGroup(dispatch, row);

        if (postBookmarkCb) {
            postBookmarkCb(row);
        }
    };

    const upsert = async (keepEditorOpenNew: boolean, saveAsNew?: boolean) => {
        const ledger_id: number = saveAsNew ? 0 : editFields?.incoming?.sc_group_ledger_id ?? 0;
        const sc_group_id = editFields?.incoming?.sc_group_id ?? "";
        const description = editFields?.incoming?.description ?? "";
        const deleted = editFields?.incoming?.deleted ?? false;
        const username = editFields?.incoming?.username ?? "";
        const rowToUpsert: ScGroupPutType = {
            ledger_id,
            sc_group_id,
            description,
            deleted,
            username,
        };
        await upsertScGroup(QueryParamsInit(getQueryParams), rowToUpsert);
        setKeepEditorOpen(keepEditorOpenNew);

        if (!keepEditorOpenNew) {
            bookmark(null);
            setEditFields(null);
            setEditorOpen(false);
        }
    };
    const contentEdit = (row?: ScGroupType): void => {
        setLastId(0);
        setEditFields(null);

        const editFieldsNew: EditFieldsType = {
            current: {},
            incoming: {},
        };

        if (row) {
            bookmark({ ...row });

            editFieldsNew.current = {
                sc_group_ledger_id: row.sc_group_ledger_id,
                sc_group_id: row.sc_group_id,
                description: row.description,
            };
        } else {
            bookmark(null);

            editFieldsNew.current = {
                sc_group_ledger_id: 0,
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
        if (!scGroupResponse?.error?.message?.length) {
            return;
        }

        CommonMessageSend(dispatch, scGroupResponse?.error as CommonError);
    }, [scGroupResponse?.error]);
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
                scGroupResponse.meta?.query_params as QueryParamsApiType,
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
        if (getQueryParams?.globalFilter?.includes(KLedgerIdSearchTokenPrefix) && scGroupResponse?.data?.length) {
            bookmark(scGroupResponse.data[0] ?? null);
        }
    }, [getQueryParams?.globalFilter, scGroupResponse?.data?.length]);
    useEffect(() => {
        if (
            !keepEditorOpen ||
            !lastId ||
            !scGroupResponse?.data?.length
        ) {
            return;
        }

        const rowToUse: ScGroupType | undefined =
            scGroupResponse.data.find(
                d => d.sc_group_ledger_id === lastId,
            );

        if (rowToUse) {
            contentEdit(rowToUse);
        }
    }, [keepEditorOpen, lastId, scGroupResponse]);

    return !menuItem ? <FvIdNoAccessMessage /> : (
        <>
            <FvScGroupModalEdit
                bookmarkedScGroup={bookmarkedScGroup}
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
                    icon={iconScGroup}
                    label={KLabelScGroup}
                    modalMode={modalMode}
                    readOnly={readOnly}
                    columns={columns}
                    columnFilters={columnFilters}
                    queryResponse={scGroupResponse}
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
