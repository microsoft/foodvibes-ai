import { PayloadAction, SerializedError } from "@reduxjs/toolkit";
import moment from "moment";
import { KApiStatusFulfilled, KApiStatusPending, KApiStatusRejected } from "./commonConstants";
import {
    CommonDetailLevel,
    CommonError,
    CommonErrorLevel,
    FeatureSliceState,
    QueryParamsApiType,
    QueryParamsType,
    QueryResponseApiType,
    QueryResponseType,
    SubFeature
} from "./commonTypes";

export const QueryParamsInit = (payload: Partial<QueryParamsType>): QueryParamsType =>
({
    idToFetch: 0,
    id2ToFetch: 0,
    pagination: {
        pageIndex: 0,
        pageSize: 10,
    },
    globalFilter: "",
    includeDetails: false,
    ...payload,
});
export const QueryParamsInitFromQueryParams = (
    queryParamsApi: QueryParamsApiType,
): QueryParamsType =>
({
    idToFetch: queryParamsApi?.id_to_fetch ?? 0,
    id2ToFetch: queryParamsApi?.id2_to_fetch ?? 0,
    globalFilter: queryParamsApi?.global_filter ?? "",
    includeDetails: queryParamsApi?.include_details ?? false,
    pagination: {
        pageIndex: queryParamsApi?.pagination?.page_index ?? 0,
        pageSize: queryParamsApi?.pagination?.page_size ?? 10,
    },
});
export const ComposeIdKey = (
    ledgerId: number = 0,
    txId: number = 0,
    prefix: string = "",
): string => `${prefix}${ledgerId}:${txId}`;
export const DetailLevelStorageKeyCompose = (idx: number, suffix: string) =>
    `sbsDetails${idx}_${suffix}`;
export const DetailLevelStorageGet = (
    idx: number,
    suffix: string,
): CommonDetailLevel => {
    const valueStr: string | null = localStorage.getItem(
        DetailLevelStorageKeyCompose(idx, suffix),
    );

    switch (valueStr) {
        case "0":
            return CommonDetailLevel.min;
        case "1":
            return CommonDetailLevel.low;
        case "2":
            return CommonDetailLevel.high;
        default:
            return CommonDetailLevel.max;
    }
};
export const DetailLevelStorageSet = (
    idx: number,
    suffix: string,
    valueNew: CommonDetailLevel,
): void => {
    localStorage.setItem(
        DetailLevelStorageKeyCompose(idx, suffix),
        valueNew.toString(),
    );
};
export const MakeErrorPayload = (
    code = 0,
    error_level = CommonErrorLevel.information,
    message = "",
): CommonError => ({ code, error_level, message, timestamp: NowTimestamp() });
export const InitSubFeature = <T>(): SubFeature<T> => ({
    queryParams: QueryParamsInit({}),
    queryResponse: {} as QueryResponseType<T>,
    lastId: 0,
    pagingIncreasing: false,
    upsertState: CommonErrorLevel.information,
    detailLevel: CommonDetailLevel.min,
    opacityPercent: 100,
    zoomPercent: 100,
});
export const GetFeatureInitialState = <T1, T2>(): FeatureSliceState<T1, T2> => ({
    loading: false,
    status: KApiStatusFulfilled,
    editPropertyName: null,
    editPorpertyLabel: "",
    showUnformattedDraft: false,
    silentOpInProgress: false,
    scannedSessions: [],
    currSessions: InitSubFeature<T1>(),
    currFacts: InitSubFeature<T2>(),
    currFactZoomed: InitSubFeature<T2>(),
});
export const SetFeatureThunkStatePending = <T, T1, T2>(
    state: FeatureSliceState<T1, T2>,
    subState: SubFeature<T>,
    payload: PayloadAction<
        undefined,
        string,
        {
            arg: { queryParams: QueryParamsType };
            requestId: string;
            requestStatus: "pending";
        },
        never
    >,
) => {
    state.loading = true;
    state.status = KApiStatusPending;
    subState.upsertState = CommonErrorLevel.information;
    subState.queryResponse.error = MakeErrorPayload();

    if (payload?.meta?.arg?.queryParams) {
        subState.queryParams = QueryParamsInitFromQueryParams({
            pagination: {
                page_index: payload.meta.arg.queryParams.pagination.pageIndex,
                page_size: payload.meta.arg.queryParams.pagination.pageSize,
            },
            global_filter: payload.meta.arg.queryParams.globalFilter,
            include_details: payload.meta.arg.queryParams.includeDetails,
        } as QueryParamsApiType);
    }
};
export const SetFeatureThunkStateFulfilled = <T, T1, T2>(
    state: FeatureSliceState<T1, T2>,
    subState: SubFeature<T>,
    payload: QueryResponseApiType<T1> | QueryResponseApiType<T2> | CommonError | null,
) => {
    state.status = KApiStatusFulfilled;

    if (payload) {
        const payloadApi: QueryResponseApiType<T> = payload as QueryResponseApiType<T>;

        subState.queryResponse = {
            ...subState.queryResponse as QueryResponseApiType<T>,
            error: payloadApi.error,
            meta: payloadApi.meta,
            data: payloadApi.data as T[] | undefined,
        };
        subState.queryParams = QueryParamsInitFromQueryParams(
            payloadApi?.meta?.query_params as QueryParamsApiType,
        );
        subState.lastId = payloadApi.meta?.last_id ?? 0;
    }

    subState.upsertState = CommonErrorLevel.success;
    state.loading = false;
};
export const SetFeatureThunkStateRejected = <T, T1, T2>(
    state: FeatureSliceState<T1, T2>,
    subState: SubFeature<T>,
    action: PayloadAction<
        unknown,
        string,
        {
            arg: { queryParams: QueryParamsType };
            requestId: string;
            requestStatus: "rejected";
            aborted: boolean;
            condition: boolean;
        } & ({ rejectedWithValue: true } | ({ rejectedWithValue: false } & {})),
        SerializedError
    >,
) => {
    state.status = KApiStatusRejected;
    subState.queryResponse = {
        ...subState.queryResponse,
        error: MakeErrorPayload(
            1,
            CommonErrorLevel.error,
            action?.error.message ?? "Error",
        ),
    };
    subState.upsertState = CommonErrorLevel.error;
    state.loading = false;
};
export const FormatTimestamp = (
    inval?: string | moment.Moment,
    spaceDelimited: boolean = false,
): string =>
    inval
        ? moment(inval).format(
            `YYYY-MM-DD${spaceDelimited ? " " : "T"}HH:mm:ss`,
        )
        : (inval as string);
export const FormatTimeDelta = (
    invalBeg?: string | moment.Moment,
    invalEnd?: string | moment.Moment,
): string => {
    const deltaS = moment(invalEnd).utc().diff(moment(invalBeg).utc()) / 1000;
    const deltaD = Math.floor(deltaS / 86400);
    const deltaH = Math.floor((deltaS - deltaD * 86400) / 3600);
    const deltaM = Math.ceil((deltaS - (deltaD * 86400 + deltaH * 3600)) / 60);

    return `${deltaD > 0 ? `${deltaD}d ` : ""}${deltaH}h ${deltaM}m`;
};
export const NowTimestamp = (): string => FormatTimestamp(moment(), true);
export const GetEffectiveApiUrl = (path: string, params?: string): string => {
    const apiUrl = `${import.meta.env.VITE_ENDPOINT_URL}/${path}`;
    return params ? `${apiUrl}/?${encodeURI(params)}` : apiUrl;
};
export const ComposeUrl = (
    path: string,
    queryParams?: QueryParamsType | null,
): string => {
    const params: string = queryParams
        ? [
            `include_details=${queryParams.includeDetails}`,
            `id_to_fetch=${queryParams.idToFetch}`,
            `id2_to_fetch=${queryParams.id2ToFetch}`,
            `global_filter=${queryParams.globalFilter?.trim()?.length ? queryParams.globalFilter : ""}`,
            `pagination=${JSON.stringify(queryParams.pagination ? {
                page_index: queryParams.pagination.pageIndex,
                page_size: queryParams.pagination.pageSize,
            } : "")}`,
        ].join("&")
        : "";

    return GetEffectiveApiUrl(path, params);
};
export const ComposeHttpHeaders = (accessToken?: string | null): { headers: { [key: string]: string } } => ({
    headers: {
        "Content-Type": "application/json",
    },
});
export const GetAverage = (arrayOfNumbers: number[]) =>
    arrayOfNumbers?.length
        ? arrayOfNumbers.reduce((sum, currentValue) => sum + currentValue, 0) /
        arrayOfNumbers.length
        : 0;
export const HaveError = (error?: CommonError) =>
    (error?.error_level ?? CommonErrorLevel.information) >
    CommonErrorLevel.information;
export const GetColorVariant = (errorLevel: CommonErrorLevel) => {
    switch (errorLevel) {
        case CommonErrorLevel.error:
        case CommonErrorLevel.fatal:
            return "error";
        case CommonErrorLevel.warning:
            return "warning";
        case CommonErrorLevel.success:
            return "success";
        case CommonErrorLevel.information:
            return "info";
        default:
            return "default";
    }
};
export const CompareObjects = (objLeft?: Object, objRight?: Object): boolean => {
    if (!objLeft && !objRight)
        return true;

    if (!objLeft || !objRight)
        return false;

    const keysObjectLeft = Object.keys(objLeft).sort();
    const keysObjectRight = Object.keys(objRight).sort();

    if (keysObjectLeft.length !== keysObjectRight.length)
        return false;

    if (keysObjectLeft.join('') !== keysObjectRight.join(''))
        return false;

    for (let idx = 0; idx < keysObjectLeft.length; idx++) {
        if (objLeft[keysObjectLeft[idx]] instanceof Array) {
            if (!(objRight[keysObjectLeft[idx]] instanceof Array))
                return false;

            if (objRight[keysObjectLeft[idx]].sort().join('') !== objLeft[keysObjectLeft[idx]].sort().join(''))
                return false;
        }
        else if (objLeft[keysObjectLeft[idx]] instanceof Date) {
            if (!(objRight[keysObjectLeft[idx]] instanceof Date))
                return false;
            if (('' + objLeft[keysObjectLeft[idx]]) !== ('' + objRight[keysObjectLeft[idx]]))
                return false;
        }
        else if (objLeft[keysObjectLeft[idx]] instanceof Function) {
            if (!(objRight[keysObjectLeft[idx]] instanceof Function))
                return false;
            //ignore functions, or check them regardless?
        }
        else if (objLeft[keysObjectLeft[idx]] instanceof Object) {
            if (!(objRight[keysObjectLeft[idx]] instanceof Object))
                return false;
            if (objLeft[keysObjectLeft[idx]] === objLeft) {//self reference?
                if (objRight[keysObjectLeft[idx]] !== objRight)
                    return false;
            }
            else if (CompareObjects(objLeft[keysObjectLeft[idx]], objRight[keysObjectLeft[idx]]) === false)
                return false;
        }
        if (objLeft[keysObjectLeft[idx]] !== objRight[keysObjectLeft[idx]])
            return false;
    }

    return true;
};
export const HexToRgba = (hex: string, opacity: number): string => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};