import { IPublicClientApplication } from "@azure/msal-browser";
import { createAppSlice } from "@foodvibes/app/createAppSlice";
import { actionSetAccessToken } from "@foodvibes/app/mainSlice";
import { RefreshAccessTokenIfNeeded } from "@foodvibes/services/authCommon";
import { KLedgerTypeProduct } from "@foodvibes/utils/commonConstants";
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
    ProductPutType,
    ProductType,
    QueryParamsType,
    QueryResponseType,
} from "@foodvibes/utils/commonTypes";
import { PayloadAction } from "@reduxjs/toolkit";
import { getProductRows, putProduct } from "./productAPI";

const name: string = KLedgerTypeProduct;
const initialState: FeatureSliceState<ProductType> =
    GetFeatureInitialState<ProductType>(name);

export const productSlice = createAppSlice({
    name,
    initialState,
    reducers: create => ({
        actionResetDataProduct: create.reducer(state => {
            state.queryParams = QueryParamsInit({}),
                state.lastId = 0,
                state.queryResponse = {} as QueryResponseType<ProductType>;
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
        actionSelectProduct: create.asyncThunk(
            async ({ queryParams, accessToken, instance }: { queryParams: QueryParamsType; accessToken: string | null; instance: IPublicClientApplication; }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }

                const response = await getProductRows(queryParams, acccessTokenToUse);

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
        actionUpsertProduct: create.asyncThunk(
            async ({
                queryParams,
                rowToUpsert,
                accessToken,
                instance,
            }: {
                queryParams: QueryParamsType;
                rowToUpsert: ProductPutType;
                accessToken: string | null;
                instance: IPublicClientApplication;
            }, { dispatch }) => {
                const acccessTokenToUse = await RefreshAccessTokenIfNeeded(accessToken, instance);

                if (acccessTokenToUse !== accessToken) {
                    dispatch(actionSetAccessToken(acccessTokenToUse));
                }
                const response = await putProduct(queryParams, rowToUpsert, acccessTokenToUse);
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
        selectProductIsLoading: state => state.loading,
        selectDetailLevelA: state => state.detailLevelA,
        selectDetailLevelB: state => state.detailLevelB,
        selectGetQueryParams: state => state.queryParams,
        selectLastIdProduct: state => state.lastId,
        selectProductResponse: state => state.queryResponse,
    },
});

export const {
    actionResetDataProduct,
    setClearStateResponse,
    actionSetLastId,
    actionSetDetailLevelA,
    actionSetDetailLevelB,
    actionSetQueryParams,
    actionSelectProduct,
    actionUpsertProduct,
} = productSlice.actions;
export const {
    selectUpsertState,
    selectProductIsLoading,
    selectDetailLevelA,
    selectDetailLevelB,
    selectGetQueryParams,
    selectLastIdProduct,
    selectProductResponse,
} = productSlice.selectors;
