import { IPublicClientApplication } from "@azure/msal-browser";
import { createAppSlice } from "@foodvibes/app/createAppSlice";
import { actionSetAccessToken } from "@foodvibes/app/mainSlice";
import { RefreshAccessTokenIfNeeded } from "@foodvibes/services/authCommon";
import { KLedgerTypeGeotrack } from "@foodvibes/utils/commonConstants";
import {
    DetailLevelStorageSet,
    GetFeatureInitialState,
    MakeErrorPayload,
    QueryParamsInit,
    SetFeatureThunkStateFulfilled,
    SetFeatureThunkStatePending,
    SetFeatureThunkStateRejected,
} from "@foodvibes/utils/commonFunctions";
import {
    CommonDetailLevel,
    CommonErrorLevel,
    FeatureSliceState,
    GeotrackPutType,
    GeotrackType,
    QueryParamsType,
    QueryResponseType,
} from "@foodvibes/utils/commonTypes";
import { PayloadAction } from "@reduxjs/toolkit";
import { getGeotrackRows, putGeotrack } from "./geotrackAPI";

const name: string = KLedgerTypeGeotrack;
const initialState: FeatureSliceState<GeotrackType> =
    GetFeatureInitialState<GeotrackType>(name);

export const geotrackSlice = createAppSlice({
    name,
    initialState,
    reducers: create => ({
        actionResetDataGeotrack: create.reducer(state => {
            state.queryParams = QueryParamsInit({}),
                state.lastId = 0,
                state.queryResponse = {} as QueryResponseType<GeotrackType>;
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
        actionSelectGeotrack: create.asyncThunk(
            async ({ queryParams, accessToken, instance }: { queryParams: QueryParamsType; accessToken: string | null; instance: IPublicClientApplication }, { dispatch }) => {
                const accessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                dispatch(actionSetAccessToken(accessTokenToUse));

                const response = await getGeotrackRows(queryParams, accessTokenToUse);

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
        actionUpsertGeotrack: create.asyncThunk(
            async ({
                queryParams,
                rowToUpsert,
                accessToken,
                instance,
            }: {
                queryParams: QueryParamsType;
                rowToUpsert: GeotrackPutType;
                accessToken: string | null;
                instance: IPublicClientApplication;
            }, { dispatch }) => {
                const accessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                dispatch(actionSetAccessToken(accessTokenToUse));

                const response = await putGeotrack(queryParams, rowToUpsert, accessTokenToUse);
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
    }),
    selectors: {
        selectUpsertState: state => state.upsertState,
        selectGeotrackIsLoading: state => state.loading,
        selectDetailLevelA: state => state.detailLevelA,
        selectDetailLevelB: state => state.detailLevelB,
        selectGetQueryParams: state => state.queryParams,
        selectLastIdGeotrack: state => state.lastId,
        selectGeotrackResponse: state => state.queryResponse,
    },
});

export const {
    actionResetDataGeotrack,
    setClearStateResponse,
    actionSetLastId,
    actionSetDetailLevelA,
    actionSetDetailLevelB,
    actionSetQueryParams,
    actionSelectGeotrack,
    actionUpsertGeotrack,
} = geotrackSlice.actions;
export const {
    selectUpsertState,
    selectGeotrackIsLoading,
    selectDetailLevelA,
    selectDetailLevelB,
    selectGetQueryParams,
    selectLastIdGeotrack,
    selectGeotrackResponse,
} = geotrackSlice.selectors;
