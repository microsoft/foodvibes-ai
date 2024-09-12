import {
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_RowData,
    MRT_SortingState,
} from "material-react-table";
import { KApiStatusFulfilled, KApiStatusLoaded, KApiStatusLoading, KApiStatusLocked, KApiStatusPending, KApiStatusPreloaded, KApiStatusRejected, KApiStatusUndefined } from "./commonConstants";

export interface ApiStatusType {
    status?:
    | typeof KApiStatusUndefined
    | typeof KApiStatusPending
    | typeof KApiStatusFulfilled
    | typeof KApiStatusRejected
    | typeof KApiStatusLoaded
    | typeof KApiStatusPreloaded
    | typeof KApiStatusLoading
    | typeof KApiStatusLocked;
}

export enum CommonDetailLevel {
    min,
    low,
    high,
    max,
}

export enum CommonCardType {
    product,
    geotrack,
    scUser,
    scGroup,
    impersonation,
}

export enum CommonErrorLevel {
    success,
    information,
    warning,
    error,
    fatal,
}

export enum CommonEditFieldType {
    text,
    number,
    datepicker,
}

export interface MenuItemType {
    label: string;
    icon: string;
    accessMask: number;
    cbFn?: () => void;
    isAlt?: boolean;
    alwaysShow?: boolean;
    showIfAuthenticated?: boolean;
    showIfUnauthenticated?: boolean;
}

export interface CommonCheckListType {
    id: number;
    shortName: string;
    name: string;
    value: number;
    checked: boolean;
}

export interface CommonCoordinates {
    latitude: number;
    longitude: number;
}

export interface CommonFlag {
    imageSrc: string;
    title: string;
    bgColor: string;
}

export interface CommonCallBack {
    detailLevel: CommonDetailLevel;
    isModal?: boolean;
    iconFlags?: CommonFlag[];
    type?: string;
    tag?: string;
    title?: string;
}

export interface CommonGridSizes {
    xl: number[];
    lg: number[];
    md: number[];
    sm: number[];
    xs: number[];
}

export interface CommonError {
    code: number;
    error_level: CommonErrorLevel;
    message: string;
    timestamp: string;
}

export interface QueryParamsType {
    includeDetails: boolean;
    reportMode: boolean;
    globalFilter: string;
    columnFilters: MRT_ColumnFiltersState;
    sorting: MRT_SortingState;
    pagination: MRT_PaginationState;
    impersonatedUser: string;
    groupId: number;
}

export interface QueryParamsApiType {
    include_details?: boolean;
    report_mode?: boolean;
    global_filter?: string;
    column_filters: MRT_ColumnFiltersState;
    sorting: MRT_SortingState;
    pagination: {
        page_index: number;
        page_size: number;
    };
    impersonated_user: string;
    group_id: number;
}

export interface QueryResponseApiType<T> {
    error?: CommonError;
    meta?: {
        row_count: number;
        last_id: number;
        query_params?: QueryParamsApiType;
    };
    data?: Array<T>;
}

export interface QueryResponseType<T> extends QueryResponseApiType<T> {
    reportData?: Array<T>;
}

export interface ForestMapUpdateType extends ApiStatusType {
    ledgerId: string;
}

export interface ForestMapRequestType extends ApiStatusType {
    id: string;
    imageUrl?: string;
    forestPixels?: object;
    deforestationPct?: number;
    forestYear?: number;
    contour?: boolean;
    color?: string;
    geojson?: {
        type?: string;
        geometry?: {
            type?: string;
            coordinates?: Array<Array<Array<number>>>;
        };
        properties?: {};
    };
}

export interface BaseSliceState extends ApiStatusType {
    loading: boolean;
}

export interface FeatureSliceState<T> extends BaseSliceState {
    queryParams: QueryParamsType;
    queryResponse: QueryResponseType<T>;
    lastId: number;
    detailLevelA: CommonDetailLevel;
    detailLevelB: CommonDetailLevel;
    historyTabIndex: number;
    legendState: boolean;
    graphCompactMode: boolean;
    graphDirection: boolean;
    opacityPercent: number;
    deforestationAbovePct: number;
    upsertState: CommonErrorLevel;
    zoomPercent: number;
}

export interface FeatureSliceStateTrackingProducts<T> extends FeatureSliceState<T> {
    centerIdx: number;
    centerCount: number;
    centerCycle: boolean;
    forestMapRequestDict: { [id: string]: ForestMapRequestType };
}

export const GetColumnsTemplate = <
    T extends MRT_RowData,
>(): MRT_ColumnDef<T> => ({
    accessorKey: "id",
    header: "ID",
    muiTableHeadCellProps: { style: {} },
    minSize: 1,
    size: 1,
    maxSize: 1,
    grow: true,
    enableEditing: false,
    enablePinning: true,
});

export interface ScUserType {
    orm_id: number;
    is_history: boolean;
    sc_user_ledger_id: number;
    sc_user_tx_id: number;
    sc_user_id: string;
    email_addr: string;
    phone: string;
    access_mask: number;
    active_roles: string;
    active_roles_long: string;
    operation_name: string;
    created_at: string;
    username: string;
}

export interface ScUserPutType {
    ledger_id: number;
    sc_user_id: string;
    email_addr: string;
    phone: string;
    access_mask: number;
    deleted: boolean;
    username: string;
}

export interface ScGroupType {
    orm_id: number;
    is_history: boolean;
    sc_group_ledger_id: number;
    sc_group_tx_id: number;
    sc_group_id: string;
    description: string;
    operation_name: string;
    created_at: string;
    username: string;
}

export interface ScGroupPutType {
    ledger_id: number;
    sc_group_id: string;
    description: string;
    deleted: boolean;
    username: string;
}

export interface ScCircleType {
    orm_id: number;
    is_history: boolean;
    sc_circle_ledger_id: number;
    sc_circle_tx_id: number;
    access_mask: number;
    operation_name: string;
    created_at: string;
    username: string;
    sc_user_is_history: boolean;
    sc_user_ledger_id: number;
    sc_user_tx_id: number;
    sc_user_id: string;
    email_addr: string;
    phone: string;
    sc_user_access_mask: number;
    sc_user_active_roles: string;
    sc_user_active_roles_long: string;
    sc_user_operation_name: string;
    sc_user_created_at: string;
    sc_user_username: string;
    sc_group_is_history: boolean;
    sc_group_ledger_id: number;
    sc_group_tx_id: number;
    sc_group_id: string;
    sc_group_description: string;
    sc_group_operation_name: string;
    sc_group_created_at: string;
    sc_group_username: string;
    active_roles: string;
    active_roles_long: string;
}

export interface ScCirclePutType {
    ledger_id: number;
    access_mask: number;
    sc_user_ledger_id: number;
    sc_user_tx_id: number;
    sc_group_ledger_id: number;
    sc_group_tx_id: number;
    deleted: boolean;
    username: string;
}

export interface ProductType {
    orm_id: number;
    is_history: boolean;
    product_ledger_id: number;
    product_tx_id: number;
    product_id: string;
    description: string;
    quantity: number;
    storage_tier: number;
    recorded_at: string;
    properties: string;
    operation_name: string;
    created_at: string;
    username: string;
    image_id: string;
    image_url: string;
}

export interface ProductPutType {
    ledger_id: number;
    product_id: string;
    description: string;
    image_id: string;
    quantity: number;
    properties: string;
    recorded_at: string;
    storage_tier: number;
    username: string;
}

export interface GeotrackType extends CommonCoordinates {
    orm_id: number;
    is_history: boolean;
    geotrack_ledger_id: number;
    geotrack_tx_id: number;
    geotrack_id: string;
    name: string;
    details: string;
    movement: number;
    recorded_at: string;
    properties: string;
    operation_name: string;
    created_at: string;
    username: string;
    image_id: string;
    image_url: string;
}

export interface GeotrackPutType extends CommonCoordinates {
    ledger_id: number;
    geotrack_id: string;
    image_id: string;
    name: string;
    details: string;
    properties: string;
    recorded_at: string;
    username: string;
}

export interface TrackingProductsType extends CommonCoordinates {
    orm_id: number;
    is_history: string;
    tracking_products_ledger_id: number;
    tracking_products_tx_id: number;
    geotrack_is_history: string;
    rank_curr_ledger_id: number;
    geotrack_ledger_id: number;
    geotrack_tx_id: number;
    product_is_history: string;
    prev_product_ledger_id: number;
    product_ledger_id: number;
    product_tx_id: number;
    recorded_at: string;
    properties: string;
    operation_name: string;
    created_at: string;
    username: string;
    geotrack_id: string;
    name: string;
    details: string;
    prev_latitude: number;
    prev_longitude: number;
    geotrack_recorded_at: string;
    geotrack_properties: string;
    geotrack_operation_name: string;
    geotrack_created_at: string;
    geotrack_username: string;
    geotrack_image_id: string;
    geotrack_image_url: string;
    product_id: string;
    description: string;
    quantity: number;
    storage_tier: number;
    product_recorded_at: string;
    product_properties: string;
    product_operation_name: string;
    product_created_at: string;
    product_username: string;
    product_image_id: string;
    product_image_url: string;
    product_aggregation: number;
    notes: string;
    geotrack_movement: number;
}

export interface TrackingProductsPutType {
    ledger_id: number;
    geotrack_ledger_id: number;
    geotrack_tx_id: number;
    product_ledger_id: number;
    product_tx_id: number;
    product_aggregation: number;
    notes: string;
    properties: string;
    recorded_at: string;
    username: string;
}

export interface TrackingProductsMapType extends TrackingProductsType {
    trackingProductsRankBeg: number;
    trackingProductsRankEnd: number;
}

export interface UploadImageType {
    fileObj: File;
    fileName: string;
    isProduct: boolean;
    contentType: string;
}

export interface EditFieldsPayloadType {
    tracking_products_ledger_id?: number;
    product_ledger_id?: number;
    product_tx_id?: number;
    geotrack_ledger_id?: number;
    geotrack_tx_id?: number;
    storage_tier?: number;
    properties?: string;
    recorded_at?: string;
    product_aggregation?: number;
    notes?: string;
    product_id?: string;
    description?: string;
    image_id?: string;
    image_url?: string;
    quantity?: number;
    geotrack_id?: string;
    details?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    sc_user_id?: string;
    email_addr?: string;
    phone?: string;
    access_mask?: number;
    deleted?: boolean;
    sc_group_id?: string;
    sc_circle_ledger_id?: number;
    sc_user_ledger_id?: number;
    sc_user_tx_id?: number;
    sc_group_ledger_id?: number;
    sc_group_tx_id?: number;
    username?: string;
}

export interface EditFieldsType {
    current?: EditFieldsPayloadType;
    incoming?: EditFieldsPayloadType;
}

export interface CommonGraphDataType {
    journeyRec: TrackingProductsMapType;
    rowData: TrackingProductsType[];
}

export interface CommonScCircleType {
    scGroupId: string;
    scUserId: string;
    accesMask: number;
}
