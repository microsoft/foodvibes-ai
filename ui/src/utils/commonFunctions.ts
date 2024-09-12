import {
    actionSetBookmarkedGeotrack,
    actionSetBookmarkedProduct,
    actionSetBookmarkedScCircle,
    actionSetBookmarkedScGroup,
    actionSetBookmarkedScUser,
} from "@foodvibes/app/mainSlice";
import iconAggrDisaggr from "@foodvibes/assets/aggr-disaggr.png";
import iconAggregation from "@foodvibes/assets/aggregation.png";
import iconDisaggregation from "@foodvibes/assets/disaggregation.png";
import iconMovement from "@foodvibes/assets/movement.png";
import { PayloadAction, SerializedError } from "@reduxjs/toolkit";
import moment from "moment";
import { KApiStatusFulfilled, KApiStatusPending, KApiStatusRejected, KStorageKeyDeforestationAbovePct, KStorageKeyGraphCompactMode, KStorageKeyGraphDirection, KStorageKeyHistoryTabIndex, KStorageKeyLegendState, KStorageKeyOpacityPercent, KStorageKeyZoomPercent } from "./commonConstants";
import { RoleChoices } from "./commonLookups";
import {
    CommonCheckListType,
    CommonCoordinates,
    CommonDetailLevel,
    CommonError,
    CommonErrorLevel,
    FeatureSliceState,
    FeatureSliceStateTrackingProducts,
    QueryParamsApiType,
    QueryParamsType,
    QueryResponseApiType,
    QueryResponseType,
    ScCircleType,
    TrackingProductsType
} from "./commonTypes";

export const QueryParamsInit = (payload: Partial<QueryParamsType>): QueryParamsType =>
({
    columnFilters: [],
    pagination: {
        pageIndex: 0,
        pageSize: 10,
    },
    sorting: [],
    globalFilter: "",
    includeDetails: false,
    reportMode: false,
    impersonatedUser: "",
    groupId: 0,
    ...payload,
});

export const QueryParamsInitFromQueryParams = (
    queryParamsApi: QueryParamsApiType,
): QueryParamsType =>
({
    columnFilters: queryParamsApi?.column_filters,
    pagination: {
        pageIndex: queryParamsApi?.pagination?.page_index,
        pageSize: queryParamsApi?.pagination?.page_size,
    },
    sorting: queryParamsApi?.sorting,
    globalFilter: queryParamsApi?.global_filter ?? "",
    includeDetails: queryParamsApi?.include_details ?? false,
    reportMode: queryParamsApi?.report_mode ?? false,
    impersonatedUser: queryParamsApi?.impersonated_user,
    groupId: queryParamsApi?.group_id,
});

export const QueryParamsCompareToQueryParamsApi = (
    queryParams: QueryParamsType,
    queryParamsApi: QueryParamsApiType,
): boolean =>
    queryParams &&
    queryParamsApi &&
    JSON.stringify(queryParams.columnFilters) ===
    JSON.stringify(queryParamsApi.column_filters) &&
    JSON.stringify(queryParams.pagination) ===
    JSON.stringify({
        pageIndex: queryParamsApi.pagination?.page_index,
        pageSize: queryParamsApi.pagination?.page_size,
    }) &&
    JSON.stringify(queryParams.sorting) ===
    JSON.stringify(queryParamsApi.sorting) &&
    queryParams.globalFilter === queryParamsApi.global_filter &&
    queryParams.includeDetails === queryParamsApi.include_details &&
    queryParams.reportMode === queryParamsApi.report_mode &&
    queryParams.impersonatedUser === queryParamsApi.impersonated_user &&
    queryParams.groupId === queryParamsApi.group_id;

export const QueryParamsCompareToQueryParams = (
    queryParamsA: QueryParamsType,
    queryParamsB: QueryParamsType,
): boolean =>
    queryParamsA &&
    queryParamsB &&
    JSON.stringify(queryParamsA.columnFilters) ===
    JSON.stringify(queryParamsB.columnFilters) &&
    JSON.stringify(queryParamsA.pagination) ===
    JSON.stringify({
        pageIndex: queryParamsB.pagination?.pageIndex,
        pageSize: queryParamsB.pagination?.pageSize,
    }) &&
    JSON.stringify(queryParamsA.sorting) ===
    JSON.stringify(queryParamsB.sorting) &&
    queryParamsA.globalFilter === queryParamsB.globalFilter &&
    queryParamsA.includeDetails === queryParamsB.includeDetails &&
    queryParamsA.reportMode === queryParamsB.reportMode;

export const ComposeIdKey = (
    ledgerId: number = 0,
    txId: number = 0,
    prefix: string = "",
): string => `${prefix}${ledgerId}:${txId}`;

export const DetailLevelStorageKeyCompose = (idx: number, suffix: string) =>
    `fvDetails${idx}_${suffix}`;

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

export const GetFeatureInitialState = <T>(
    suffix: string,
): FeatureSliceState<T> => ({
    loading: false,
    status: KApiStatusFulfilled,
    queryParams: QueryParamsInit({}),
    queryResponse: {} as QueryResponseType<T>,
    lastId: 0,
    detailLevelA: DetailLevelStorageGet(0, suffix),
    detailLevelB: DetailLevelStorageGet(1, suffix),
    historyTabIndex: JSON.parse(
        localStorage.getItem(KStorageKeyHistoryTabIndex) ?? "0",
    ),
    legendState: JSON.parse(
        localStorage.getItem(KStorageKeyLegendState) ?? "false",
    ),
    graphCompactMode: JSON.parse(
        localStorage.getItem(KStorageKeyGraphCompactMode) ?? "false",
    ) === true,
    graphDirection: JSON.parse(
        localStorage.getItem(KStorageKeyGraphDirection) ?? "false",
    ) === true,
    opacityPercent: Number(
        localStorage.getItem(KStorageKeyOpacityPercent) ?? "50",
    ),
    deforestationAbovePct: Number(
        localStorage.getItem(KStorageKeyDeforestationAbovePct) ?? "10",
    ),
    upsertState: CommonErrorLevel.information,
    zoomPercent: Number(
        localStorage.getItem(KStorageKeyZoomPercent) ?? "100",
    ),
});

export const GetFeatureInitialStateExt = <T>(
    suffix: string,
): FeatureSliceStateTrackingProducts<T> => ({
    ...GetFeatureInitialState<T>(suffix),
    centerIdx: 0,
    centerCount: 0,
    centerCycle: false,
    forestMapRequestDict: {},
});

export const SetFeatureThunkStatePending = <T>(
    state: FeatureSliceState<T>,
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
    state.upsertState = CommonErrorLevel.information;
    state.queryResponse.error = MakeErrorPayload();

    if (
        payload?.meta?.arg?.queryParams &&
        !payload.meta.arg.queryParams.reportMode
    ) {
        state.queryParams = QueryParamsInitFromQueryParams({
            column_filters: payload.meta.arg.queryParams.columnFilters,
            pagination: {
                page_index: payload.meta.arg.queryParams.pagination.pageIndex,
                page_size: payload.meta.arg.queryParams.pagination.pageSize,
            },
            sorting: payload.meta.arg.queryParams.sorting,
            global_filter: payload.meta.arg.queryParams.globalFilter,
            include_details: payload.meta.arg.queryParams.includeDetails,
            report_mode: payload.meta.arg.queryParams.reportMode,
        } as QueryParamsApiType);
    }
};

export const SetFeatureThunkStateFulfilled = <T>(
    state: FeatureSliceState<T>,
    payload: QueryResponseApiType<T> | QueryResponseApiType<TrackingProductsType> | QueryResponseApiType<ScCircleType> | CommonError,
) => {
    const payloadApi: QueryResponseApiType<T> =
        payload as QueryResponseApiType<T>;
    state.status = KApiStatusFulfilled;

    if (payloadApi?.meta?.query_params?.report_mode) {
        state.queryResponse = {
            ...state.queryResponse,
            reportData: payloadApi?.data,
        };

        if (!state.queryResponse.data?.length && payloadApi?.data?.length) {
            // Cover cases where we have report data and no matching grid data
            state.queryResponse = {
                ...state.queryResponse,
                data: [payloadApi.data[0]],
            };
        }
    } else {
        state.queryResponse = {
            ...state.queryResponse,
            ...payloadApi,
        };
        state.queryParams = QueryParamsInitFromQueryParams(
            payloadApi?.meta?.query_params as QueryParamsApiType,
        );
        state.lastId = payloadApi.meta?.last_id ?? 0;
    }

    state.loading = false;
};

export const SetFeatureThunkStateRejected = <T>(
    state: FeatureSliceState<T>,
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
    state.queryResponse = {
        ...state.queryResponse,
        error: MakeErrorPayload(
            1,
            CommonErrorLevel.error,
            action?.error.message ?? "Error",
        ),
    };
    state.loading = false;
};

export const BookmarkScUser = (dispatch: any, row: any) => {
    if (dispatch) {
        dispatch(actionSetBookmarkedScUser(row ? { ...row } : null));
    }
};

export const BookmarkScGroup = (dispatch: any, row: any) => {
    if (dispatch) {
        dispatch(actionSetBookmarkedScGroup(row ? { ...row } : null));
    }
};

export const BookmarkScCircle = (dispatch: any, row: any) => {
    if (dispatch) {
        dispatch(actionSetBookmarkedScCircle(row ? { ...row } : null));
    }
};

export const BookmarkGeotrack = (dispatch: any, row: any) => {
    if (dispatch) {
        dispatch(actionSetBookmarkedGeotrack(row ? { ...row } : null));
    }
};

export const BookmarkProduct = (dispatch: any, row: any) => {
    if (dispatch) {
        dispatch(actionSetBookmarkedProduct(row ? { ...row } : null));
    }
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
    return params ? `${apiUrl}/?${params}` : apiUrl;
};

export const ComposeUrl = (
    path: string,
    queryParams?: QueryParamsType | null,
): string => {
    const params: string = queryParams
        ? [
            `include_details=${queryParams.includeDetails}`,
            `report_mode=${queryParams.reportMode}`,
            `global_filter=${queryParams.globalFilter?.trim()?.length ? queryParams.globalFilter : ""}`,
            `column_filters=${JSON.stringify(queryParams.columnFilters ?? "")}`,
            `sorting=${JSON.stringify(queryParams.sorting ?? "")}`,
            `pagination=${JSON.stringify(queryParams.pagination ? {
                page_index: queryParams.pagination.pageIndex,
                page_size: queryParams.pagination.pageSize,
            } : "")}`,
            `impersonated_user=${queryParams.impersonatedUser}`,
            `group_id=${queryParams.groupId ?? 0}`,
        ].join("&")
        : "";

    return GetEffectiveApiUrl(path, params);
};

export const ComposeUrlGeo = (
    path: string,
    id?: string,
    coordinates?: CommonCoordinates,
): string => {
    const paramsFlds: string[] = [`id=${id}`];

    if (coordinates) {
        paramsFlds.push(`lat=${coordinates.latitude}`);
        paramsFlds.push(`lon=${coordinates.longitude}`);
    }

    return GetEffectiveApiUrl(path, paramsFlds.join("&"));
};

export const ComposeUrlImage = (
    path: string,
    imageId: string,
    isProduct: boolean,
    contentType: string,
): string => {
    const paramsFlds: string[] = [
        `image_id=${encodeURIComponent(imageId)}`,
        `is_product=${isProduct ? true : false}`,
        `content_type=${encodeURIComponent(contentType)}`,
    ];

    return GetEffectiveApiUrl(path, paramsFlds.join("&"));
};

export const ComposeHttpHeaders = (accessToken: string | null): { headers: { [key: string]: string } } => ({
    headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    },
});

export const GetAggregationLabelColor = (
    aggregationValue: number,
    blankColor: string = "inherit",
): string =>
    aggregationValue === 2
        ? "tan"
        : aggregationValue > 0
            ? "moccasin"
            : aggregationValue < 0
                ? "lightsalmon"
                : blankColor;

export const GetAggregationLabel = (
    aggregationValue: number,
    blankIfNone: boolean = true,
): string =>
    aggregationValue === 2
        ? "Aggr/Disaggr"
        : aggregationValue > 0
            ? "Aggregation"
            : aggregationValue < 0
                ? "Disaggregation"
                : blankIfNone
                    ? ""
                    : "None";

export const GetAggregationIcon = (aggregationValue: number): string =>
    aggregationValue === 2
        ? iconAggrDisaggr
        : aggregationValue > 0
            ? iconAggregation
            : aggregationValue < 0
                ? iconDisaggregation
                : "";

export const GetMovementLabelColor = (haveMovement: number): string =>
    haveMovement > 0 ? "lightgreen" : "lightpink";

export const GetMovementLabel = (haveMovement: number): string =>
    haveMovement > 0 ? "Movement" : "Not Movement";

export const GetMovementIcon = (haveMovement: number): string =>
    haveMovement > 0 ? iconMovement : "";

export const SetAggregationIndicator = (
    haveAggregation: boolean,
    haveDisaggregation: boolean,
): number =>
    haveAggregation && haveDisaggregation
        ? 2
        : haveAggregation
            ? 1
            : haveDisaggregation
                ? -1
                : 0;

export const LoadMicrosoftMapsApi = (key?: string): Promise<void> => {
    const callbackName = "GetMap";
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.defer = true;
        script.src = `https://www.bing.com/api/maps/mapcontrol?branch=experimental&callback=${callbackName}&key=${key}`;
        window[callbackName] = () => {
            resolve();
        };
        script.onerror = (error: Event | string) => {
            reject(error);
        };
        document.body.appendChild(script);
    });
};

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

export const GetRolesActive = (access_mask: number): string => {
    const rolesActive: CommonCheckListType[] = RoleChoices.map(e => ({
        ...e,
        checked: e.value & access_mask ? true : false
    }));

    const rolesCaption: string = rolesActive.filter(e => e.checked).map(e => e.shortName).join(', ');

    return rolesCaption.length ? rolesCaption : "NO ROLES DEFINED";
};
