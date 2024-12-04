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
    ISbsFactPutType,
    ISbsFactType,
    QueryParamsType,
    QueryResponseApiType,
    QueryResponseType,
} from "@foodvibes/utils/commonTypes";
import { PayloadAction } from "@reduxjs/toolkit";
import { getProductRows, putProduct } from "./productAPI";

const name: string = KLedgerTypeProduct;
const initialState: FeatureSliceState<ISbsFactType> =
    GetFeatureInitialState<ISbsFactType>(name);

export const productSlice = createAppSlice({
    name,
    initialState,
    reducers: create => ({
        actionResetDataProduct: create.reducer(state => {
            state.queryParams = QueryParamsInit({}),
                state.lastId = 0,
                state.queryResponse = {} as QueryResponseType<ISbsFactType>;
        }),
        setClearStateResponse: create.reducer(state => {
            state.queryResponse.error = MakeErrorPayload();
        }),
        actionSetLastId: create.reducer(
            (state, action: PayloadAction<number>) => {
                state.lastId = action.payload;
            },
        ),
        actionSetPagingIncreasing: create.reducer(
            (state, action: PayloadAction<boolean>) => {
                state.pagingIncreasing = action.payload;
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
            async ({ queryParams }: { queryParams: QueryParamsType; }, { }) => {
                const response = await getProductRows(queryParams);

                return response;
            },
            {
                pending: (state, payload) => {
                    SetFeatureThunkStatePending(state, payload);
                    state.queryParams = payload.meta.arg.queryParams;
                },
                fulfilled: (state, action) => {
                    // const pageSize = state.queryParams.pagination?.pageSize ?? 10;
                    // const pageIndexOld = state.queryParams.pagination?.pageIndex ?? 0;
                    // const pageIndexNew = action.payload.meta?.query_params?.pagination?.page_index ?? 0;
                    // const pagingIncreasing: boolean = pageIndexOld > pageIndexNew;
                    // const dataOld: ISbsFactType[] = (state.queryResponse.data as ISbsFactType[]) ?? [];
                    // const dataNew: ISbsFactType[] = (action.payload.data as ISbsFactType[]) ?? [];
                    // const data: ISbsFactType[] = pagingIncreasing ?
                    //     [...dataOld.slice(-pageSize), ...dataNew] :
                    //     [...dataNew, ...dataOld.slice(0, pageSize)];

                    const dataOld: ISbsFactType[] = (state.queryResponse.data as ISbsFactType[]) ?? [];
                    const dataNew: ISbsFactType[] = (action.payload.data as ISbsFactType[]) ?? [];
                    const payload: QueryResponseApiType<ISbsFactType> = {
                        ...action.payload,
                        data: [...dataOld, ...dataNew],
                    };
                    SetFeatureThunkStateFulfilled(state, payload);
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
            }: {
                queryParams: QueryParamsType;
                rowToUpsert: ISbsFactPutType;
            }, { }) => {
                const response = await putProduct(queryParams, rowToUpsert);
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
        selectPagingIncreasing: state => state.pagingIncreasing,
        selectProductResponse: state => state.queryResponse,
    },
});

export const {
    actionResetDataProduct,
    setClearStateResponse,
    actionSetLastId,
    actionSetPagingIncreasing,
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
    selectPagingIncreasing,
    selectProductResponse,
} = productSlice.selectors;
