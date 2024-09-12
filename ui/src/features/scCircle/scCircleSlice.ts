import { IPublicClientApplication } from "@azure/msal-browser";
import { createAppSlice } from "@foodvibes/app/createAppSlice";
import { actionSetAccessToken } from "@foodvibes/app/mainSlice";
import { RefreshAccessTokenIfNeeded } from "@foodvibes/services/authCommon";
import { KLedgerTypeScCircle } from "@foodvibes/utils/commonConstants";
import {
    DetailLevelStorageSet,
    GetFeatureInitialState,
    MakeErrorPayload,
    SetFeatureThunkStateFulfilled,
    SetFeatureThunkStatePending,
    SetFeatureThunkStateRejected,
} from "@foodvibes/utils/commonFunctions";
import {
    CommonDetailLevel,
    CommonErrorLevel,
    FeatureSliceState,
    QueryParamsType,
    ScCirclePutType,
    ScCircleType
} from "@foodvibes/utils/commonTypes";
import { PayloadAction } from "@reduxjs/toolkit";
import { getScCircleRows, putScCircle } from "./scCircleAPI";

const name: string = KLedgerTypeScCircle;
const initialState: FeatureSliceState<ScCircleType> =
    GetFeatureInitialState<ScCircleType>(name);

export const scCircleSlice = createAppSlice({
    name,
    initialState,
    reducers: create => ({
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
        actionSelectScCircle: create.asyncThunk(
            async ({ queryParams, accessToken, instance, }: { queryParams: QueryParamsType; accessToken: string | null; instance: IPublicClientApplication; }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }

                const response = await getScCircleRows(queryParams, acccessTokenToUse);

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
        actionUpsertScCircle: create.asyncThunk(
            async ({
                queryParams,
                rowToUpsert,
                accessToken,
                instance,
            }: {
                queryParams: QueryParamsType;
                rowToUpsert: ScCirclePutType;
                accessToken: string | null;
                instance: IPublicClientApplication;
            }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }

                const response = await putScCircle(queryParams, rowToUpsert, acccessTokenToUse);

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
        selectScCircleIsLoading: state => state.loading,
        selectDetailLevelA: state => state.detailLevelA,
        selectDetailLevelB: state => state.detailLevelB,
        selectGetQueryParams: state => state.queryParams,
        selectLastIdScCircle: state => state.lastId,
        selectScCircleResponse: state => state.queryResponse,
    },
});

export const {
    setClearStateResponse,
    actionSetLastId,
    actionSetDetailLevelA,
    actionSetDetailLevelB,
    actionSetQueryParams,
    actionSelectScCircle,
    actionUpsertScCircle,
} = scCircleSlice.actions;
export const {
    selectUpsertState,
    selectScCircleIsLoading,
    selectDetailLevelA,
    selectDetailLevelB,
    selectGetQueryParams,
    selectLastIdScCircle,
    selectScCircleResponse,
} = scCircleSlice.selectors;
