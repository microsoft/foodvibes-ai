import {
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_RowData,
    MRT_SortingState,
} from "material-react-table";
import { KApiStatusFulfilled, KApiStatusLoaded, KApiStatusLoading, KApiStatusLocked, KApiStatusPending, KApiStatusPreloaded, KApiStatusRejected, KApiStatusUndefined } from "./commonConstants";
import { RefObject } from "react";

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
export enum CommonErrorLevel {
    success,
    information,
    warning,
    error,
    fatal,
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
export interface CommonError {
    code: number;
    error_level: CommonErrorLevel;
    message: string;
    timestamp: string;
}
export interface IPagination {
    pageIndex: number;
    pageSize: number;
}
export interface QueryParamsType {
    idToFetch: number;
    id2ToFetch: number;
    includeDetails: boolean;
    globalFilter: string;
    pagination: IPagination;
}
export interface QueryParamsApiType {
    id_to_fetch?: number;
    id2_to_fetch?: number;
    include_details?: boolean;
    global_filter?: string;
    pagination?: {
        page_index: number;
        page_size: number;
    };
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
export interface BaseSliceState extends ApiStatusType {
    loading: boolean;
}
export interface SubFeature<T> {
    queryParams: QueryParamsType;
    queryResponse: QueryResponseType<T>;
    lastId: number;
    pagingIncreasing: boolean;
    upsertState: CommonErrorLevel;
    detailLevel: CommonDetailLevel;
    opacityPercent: number;
    zoomPercent: number;
}
export interface FeatureSliceState<T1, T2> extends BaseSliceState {
    editPropertyName: string | null;
    editPorpertyLabel: string;
    showUnformattedDraft: boolean;
    scannedSessions: string[];
    currSessions: SubFeature<T1>;
    currFacts: SubFeature<T2>;
    currFactZoomed: SubFeature<T2>;
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
export interface ILayoutTracker {
    ref: RefObject<HTMLDivElement>;
    isOverflow: boolean;
    top: number;
    left: number;
    width: number;
    height: number;
}
export interface ISbsCommonType {
    id: number;
}
export interface ISbsReviewType {
    reviewer?: string;
    review_date?: string;
}
export interface ISbsSessionType extends ISbsCommonType, ISbsReviewType {
    fact_count: number;
    path: string;
    modified: string;
}
export interface ISbsFactPutType extends ISbsReviewType {
    property_name: string;
    is_numeric: boolean;
    property_value: string;
    property_value_numeric: number;
}
export interface ISbsFactType extends ISbsCommonType, ISbsReviewType {
    session_id: number;
    subclause_id?: string;
    subclause?: string;
    draft_id?: string;
    content_id?: string;
    document_text_reference?: string;
    draft?: string;
    draft_unjsonified?: string;
    main_clause?: string;
    content?: string;
    explanation_completeness?: string;
    score_correctness?: number;
    score_completeness?: number;
    score_clarity?: number;
    score_accuracy?: number;
    score_consistency?: number;
}
