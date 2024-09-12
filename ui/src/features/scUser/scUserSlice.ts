import { IPublicClientApplication } from "@azure/msal-browser";
import { createAppSlice } from "@foodvibes/app/createAppSlice";
import { actionSetAccessToken } from "@foodvibes/app/mainSlice";
import { RefreshAccessTokenIfNeeded } from "@foodvibes/services/authCommon";
import { KLedgerTypeScUser } from "@foodvibes/utils/commonConstants";
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
    ScUserPutType,
    ScUserType,
} from "@foodvibes/utils/commonTypes";
import { PayloadAction } from "@reduxjs/toolkit";
import { getScUserRows, putScUser } from "./scUserAPI";

const name: string = KLedgerTypeScUser;
const initialState: FeatureSliceState<ScUserType> =
    GetFeatureInitialState<ScUserType>(name);

export const scUserSlice = createAppSlice({
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
        actionSelectScUser: create.asyncThunk(
            async ({ queryParams, accessToken, instance, }: { queryParams: QueryParamsType; accessToken: string | null; instance: IPublicClientApplication; }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }

                const response = await getScUserRows(queryParams, acccessTokenToUse);

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
        actionUpsertScUser: create.asyncThunk(
            async ({
                queryParams,
                rowToUpsert,
                accessToken,
                instance,
            }: {
                queryParams: QueryParamsType;
                rowToUpsert: ScUserPutType;
                accessToken: string | null;
                instance: IPublicClientApplication;
            }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }

                const response = await putScUser(queryParams, rowToUpsert, acccessTokenToUse);

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
        selectScUserIsLoading: state => state.loading,
        selectDetailLevelA: state => state.detailLevelA,
        selectDetailLevelB: state => state.detailLevelB,
        selectGetQueryParams: state => state.queryParams,
        selectLastIdScUser: state => state.lastId,
        selectScUserResponse: state => state.queryResponse,
    },
});

export const {
    setClearStateResponse,
    actionSetLastId,
    actionSetDetailLevelA,
    actionSetDetailLevelB,
    actionSetQueryParams,
    actionSelectScUser,
    actionUpsertScUser,
} = scUserSlice.actions;
export const {
    selectUpsertState,
    selectScUserIsLoading,
    selectDetailLevelA,
    selectDetailLevelB,
    selectGetQueryParams,
    selectLastIdScUser,
    selectScUserResponse,
} = scUserSlice.selectors;
