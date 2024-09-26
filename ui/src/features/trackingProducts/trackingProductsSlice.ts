import { IPublicClientApplication } from "@azure/msal-browser";
import { createAppSlice } from "@foodvibes/app/createAppSlice";
import { actionSetAccessToken } from "@foodvibes/app/mainSlice";
import { RefreshAccessTokenIfNeeded } from "@foodvibes/services/authCommon";
import { KApiStatusFulfilled, KApiStatusLoaded, KApiStatusLoading, KApiStatusLocked, KApiStatusPending, KApiStatusPreloaded, KApiStatusRejected, KStorageKeyDeforestationAbovePct, KStorageKeyGraphCompactMode, KStorageKeyGraphDirection, KStorageKeyHistoryTabIndex, KStorageKeyLegendState, KStorageKeyOpacityPercent, KStorageKeyZoomPercent } from "@foodvibes/utils/commonConstants";
import {
    DetailLevelStorageSet,
    GetFeatureInitialStateExt as GetFeatureInitialStateTrackingProducts,
    MakeErrorPayload,
    QueryParamsInit,
    SetFeatureThunkStateFulfilled,
    SetFeatureThunkStatePending,
    SetFeatureThunkStateRejected
} from "@foodvibes/utils/commonFunctions";
import {
    CommonCoordinates,
    CommonDetailLevel,
    CommonErrorLevel,
    FeatureSliceStateTrackingProducts,
    ForestMapRequestType,
    ForestMapUpdateType,
    QueryParamsType,
    QueryResponseType,
    TrackingProductsPutType,
    TrackingProductsType
} from "@foodvibes/utils/commonTypes";
import { PayloadAction } from "@reduxjs/toolkit";
import {
    getAdma,
    getTrackingProductsRows,
    postForestMap,
    putTrackingProducts,
} from "./trackingProductsAPI";
import { act } from "react";

const name: string = "trackingProducts";
const initialState: FeatureSliceStateTrackingProducts<TrackingProductsType> =
    GetFeatureInitialStateTrackingProducts<TrackingProductsType>(name);

export const trackingProductsSlice = createAppSlice({
    name,
    initialState,
    reducers: create => ({
        actionResetDataTrackingProducts: create.reducer(state => {
            state.queryParams = QueryParamsInit({}),
                state.lastId = 0,
                state.queryResponse = {} as QueryResponseType<TrackingProductsType>;
        }),
        setClearStateResponse: create.reducer(state => {
            state.queryResponse.error = MakeErrorPayload();
        }),
        actionSetLastId: create.reducer(
            (state, action: PayloadAction<number>) => {
                state.lastId = action.payload;
            },
        ),
        actionSetDetailLevelA: create.reducer(
            (state, action: PayloadAction<CommonDetailLevel>) => {
                state.detailLevelA = action.payload;

                DetailLevelStorageSet(0, name, action.payload);
            },
        ),
        actionSetDetailLevelB: create.reducer(
            (state, action: PayloadAction<CommonDetailLevel>) => {
                state.detailLevelB = action.payload;

                DetailLevelStorageSet(1, name, action.payload);
            },
        ),
        actionSetGraphCompactMode: create.reducer(
            (state, action: PayloadAction<boolean>) => {
                state.graphCompactMode = action.payload;

                localStorage.setItem(
                    KStorageKeyGraphCompactMode,
                    action.payload.toString(),
                );
            },
        ),
        actionSetGraphDirection: create.reducer(
            (state, action: PayloadAction<boolean>) => {
                state.graphDirection = action.payload;

                localStorage.setItem(
                    KStorageKeyGraphDirection,
                    action.payload.toString(),
                );
            },
        ),
        actionSetHistoryTabIndex: create.reducer(
            (state, action: PayloadAction<number>) => {
                state.historyTabIndex = action.payload;

                localStorage.setItem(
                    KStorageKeyHistoryTabIndex,
                    action.payload.toString(),
                );
            },
        ),
        actionSetLegendState: create.reducer(
            (state, action: PayloadAction<boolean>) => {
                state.legendState = action.payload;

                localStorage.setItem(
                    KStorageKeyLegendState,
                    action.payload.toString(),
                );
            },
        ),
        actionSetOpacityPercent: create.reducer(
            (state, action: PayloadAction<number>) => {
                state.opacityPercent = action.payload;

                localStorage.setItem(
                    KStorageKeyOpacityPercent,
                    action.payload.toString(),
                );
            },
        ),
        actionSetDeforestationAbovePct: create.reducer(
            (state, action: PayloadAction<number>) => {
                state.deforestationAbovePct = action.payload;

                localStorage.setItem(
                    KStorageKeyDeforestationAbovePct,
                    action.payload.toString(),
                );
            },
        ),
        actionSetCenterIdx: create.reducer(
            (state, action: PayloadAction<number>) => {
                state.centerIdx = action.payload;
            },
        ),
        actionSetCenterCount: create.reducer(
            (state, action: PayloadAction<number>) => {
                state.centerCount = action.payload;
            },
        ),
        actionSetCenterCycle: create.reducer(
            (state, action: PayloadAction<boolean>) => {
                state.centerCycle = action.payload;
            },
        ),
        actionSetForestMapState: create.reducer(
            (state, action: PayloadAction<ForestMapUpdateType>) => {
                if (!state.forestMapRequestDict[action.payload.ledgerId]) {
                    state.forestMapRequestDict[action.payload.ledgerId] = {
                        id: action.payload.ledgerId,
                    };
                }

                state.forestMapRequestDict[action.payload.ledgerId].status =
                    action.payload.status;
            },
        ),
        actionSetQueryParams: create.reducer(
            (state, action: PayloadAction<Partial<QueryParamsType> | null>) => {
                state.queryParams = {
                    ...state.queryParams,
                    ...(action.payload as Partial<QueryParamsType>),
                    pagination: {
                        ...state.queryParams.pagination,
                        ...action.payload?.pagination,
                    },
                };
            },
        ),
        actionSetZoomPercent: create.reducer(
            (state, action: PayloadAction<number>) => {
                state.zoomPercent = action.payload;

                localStorage.setItem(
                    KStorageKeyZoomPercent,
                    action.payload.toString(),
                );
            },
        ),
        actionSelectTrackingProducts: create.asyncThunk(
            async ({ queryParams, accessToken, instance, }: { queryParams: QueryParamsType; accessToken: string | null; instance: IPublicClientApplication; }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }

                const response = await getTrackingProductsRows(queryParams, acccessTokenToUse);

                return response;
            },
            {
                pending: (state, payload) => {
                    SetFeatureThunkStatePending(state, payload);
                },
                fulfilled: (state, action) => {
                    SetFeatureThunkStateFulfilled(state, action.payload);
                },
                rejected: (state, action) => {
                    SetFeatureThunkStateRejected(state, action);
                },
            },
        ),
        actionUpsertTrackingProducts: create.asyncThunk(
            async ({
                queryParams,
                rowToUpsert,
                accessToken,
                instance,
            }: {
                queryParams: QueryParamsType;
                rowToUpsert: TrackingProductsPutType;
                accessToken: string | null;
                instance: IPublicClientApplication;
            }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }

                const response = await putTrackingProducts(queryParams, rowToUpsert, acccessTokenToUse,);

                return response;
            },
            {
                pending: (state, payload) => {
                    SetFeatureThunkStatePending(state, payload);
                },
                fulfilled: (state, action) => {
                    SetFeatureThunkStateFulfilled(state, action.payload);
                    state.upsertState = CommonErrorLevel.success;
                },
                rejected: (state, action) => {
                    SetFeatureThunkStateRejected(state, action);
                    state.upsertState = CommonErrorLevel.error;
                },
            },
        ),
        /*
            State transitions for state.forestMapRequestDict[payload.meta.arg.ledgerId].status:

            under actionGetAdma
            if null
                KApiStatusPending -> KApiStatusPreloaded | KApiStatusRejected

            under actionFetchForestMap
            if KApiStatusPreloaded
                KApiStatusLoading -> KApiStatusLoaded | KApiStatusRejected -> KApiStatusLocked (upon image rendered)
        */
        actionGetAdma: create.asyncThunk(
            async ({
                ledgerId,
                coordinates,
                accessToken,
                instance,
            }: {
                ledgerId: string;
                coordinates: CommonCoordinates;
                accessToken: string | null;
                instance: IPublicClientApplication;
            }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }

                const response = await getAdma(ledgerId, coordinates, acccessTokenToUse);

                return response;
            },
            {
                pending: (state, payload) => {
                    state.loading = true;
                    state.status = KApiStatusPending;
                    state.forestMapRequestDict[payload.meta.arg.ledgerId] = {
                        id: payload.meta.arg.ledgerId,
                        forestYear: 2020,
                        contour: true,
                        color: "red",
                        status: KApiStatusPending,
                    };
                    state.queryResponse.error = MakeErrorPayload();
                },
                fulfilled: (state, action) => {
                    state.status = KApiStatusFulfilled;

                    if (action.payload.status === "option=off") {
                        state.forestMapRequestDict[action.meta.arg.ledgerId] = {
                            ...state.forestMapRequestDict[action.meta.arg.ledgerId],
                            geojson: {
                                type: "Feature",
                                geometry: action.payload.geojson,
                                properties: {},
                            },
                            status: KApiStatusLocked,
                        };
                    } else {
                        state.forestMapRequestDict[action.meta.arg.ledgerId] = {
                            ...state.forestMapRequestDict[action.meta.arg.ledgerId],
                            geojson: {
                                type: "Feature",
                                geometry: action.payload.geojson,
                                properties: {},
                            },
                            status: KApiStatusPreloaded,
                        };
                    }
                    state.loading = false;
                },
                rejected: (state, action) => {
                    state.status = KApiStatusRejected;
                    state.forestMapRequestDict[
                        action.meta.arg.ledgerId
                    ].status = KApiStatusRejected;
                    state.loading = false;
                    state.queryResponse.error = MakeErrorPayload(
                        1,
                        CommonErrorLevel.error,
                        action?.error.message ?? "Error",
                    );
                },
            },
        ),
        actionFetchForestMap: create.asyncThunk(
            async ({
                forestMapRequest,
                accessToken,
                instance,
            }: {
                forestMapRequest: ForestMapRequestType;
                accessToken: string | null;
                instance: IPublicClientApplication;
            }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }

                const response = await postForestMap(forestMapRequest, acccessTokenToUse);

                return response;
            },
            {
                pending: (state, payload) => {
                    state.loading = true;
                    state.status = KApiStatusPending;
                    state.forestMapRequestDict[
                        payload.meta.arg.forestMapRequest.id
                    ].status = KApiStatusLoading;
                    state.queryResponse.error = MakeErrorPayload();
                },
                fulfilled: (state, action) => {
                    state.status = KApiStatusFulfilled;

                    if (!action.payload.image_url?.length) {
                        state.queryResponse.error = MakeErrorPayload(
                            1,
                            CommonErrorLevel.warning,
                            `Geotrack Ledger ID ${action.meta.arg.forestMapRequest.id} has no matching deforestation data`,
                        );
                        state.forestMapRequestDict[
                            action.meta.arg.forestMapRequest.id
                        ].status = KApiStatusRejected;
                    } else if (action.payload.image_url == "option=off") {
                        state.forestMapRequestDict[
                            action.meta.arg.forestMapRequest.id
                        ].imageUrl = "";
                        state.forestMapRequestDict[
                            action.meta.arg.forestMapRequest.id
                        ].forestPixels = {};
                        state.forestMapRequestDict[
                            action.meta.arg.forestMapRequest.id
                        ].deforestationPct = 0;
                        state.forestMapRequestDict[
                            action.meta.arg.forestMapRequest.id
                        ].status = KApiStatusLocked;
                    } else {
                        state.forestMapRequestDict[
                            action.meta.arg.forestMapRequest.id
                        ].imageUrl = action.payload.image_url;
                        state.forestMapRequestDict[
                            action.meta.arg.forestMapRequest.id
                        ].forestPixels = action.payload.forest_pixels;
                        state.forestMapRequestDict[
                            action.meta.arg.forestMapRequest.id
                        ].deforestationPct = action.payload.deforestation_pct;
                        state.forestMapRequestDict[
                            action.meta.arg.forestMapRequest.id
                        ].status = KApiStatusLoaded;
                    }

                    state.loading = false;
                },
                rejected: (state, action) => {
                    state.status = KApiStatusRejected;
                    state.forestMapRequestDict[
                        action.meta.arg.forestMapRequest.id
                    ].status = KApiStatusRejected;
                    state.loading = false;
                    state.queryResponse.error = MakeErrorPayload(
                        1,
                        CommonErrorLevel.error,
                        action?.error.message ?? "Error",
                    );
                },
            },
        ),
    }),
    selectors: {
        selectUpsertState: state => state.upsertState,
        selectTrackingProductsLoading: state => state.loading,
        selectDetailLevelA: state => state.detailLevelA,
        selectDetailLevelB: state => state.detailLevelB,
        selectGraphCompactMode: state => state.graphCompactMode,
        selectGraphDirection: state => state.graphDirection,
        selectHistoryTabIndex: state => state.historyTabIndex,
        selectLegendState: state => state.legendState,
        selectOpacityPercent: state => state.opacityPercent,
        selectDeforestationAbovePct: state => state.deforestationAbovePct,
        selectCenterIdx: state => state.centerIdx,
        selectCenterCount: state => state.centerCount,
        selectCenterCycle: state => state.centerCycle,
        selectGetQueryParams: state => state.queryParams,
        selectLastIdTrackingProducts: state => state.lastId,
        selectTrackingProductsResponse: state => state.queryResponse,
        selectForestMapRequestDict: state => state.forestMapRequestDict,
        selectZoomPercent: state => state.zoomPercent,
    },
});

export const {
    actionResetDataTrackingProducts,
    setClearStateResponse,
    actionSetLastId,
    actionSetDetailLevelA,
    actionSetDetailLevelB,
    actionSetGraphCompactMode,
    actionSetGraphDirection,
    actionSetHistoryTabIndex,
    actionSetLegendState,
    actionSetOpacityPercent,
    actionSetDeforestationAbovePct,
    actionSetCenterIdx,
    actionSetCenterCount,
    actionSetCenterCycle,
    actionSetForestMapState,
    actionSetQueryParams,
    actionSelectTrackingProducts,
    actionSetZoomPercent,
    actionUpsertTrackingProducts,
    actionGetAdma,
    actionFetchForestMap,
} = trackingProductsSlice.actions;
export const {
    selectUpsertState,
    selectTrackingProductsLoading,
    selectDetailLevelA,
    selectDetailLevelB,
    selectGraphCompactMode,
    selectGraphDirection,
    selectHistoryTabIndex,
    selectLegendState,
    selectOpacityPercent,
    selectDeforestationAbovePct,
    selectCenterIdx,
    selectCenterCount,
    selectCenterCycle,
    selectGetQueryParams,
    selectLastIdTrackingProducts,
    selectTrackingProductsResponse,
    selectForestMapRequestDict,
    selectZoomPercent,
} = trackingProductsSlice.selectors;
