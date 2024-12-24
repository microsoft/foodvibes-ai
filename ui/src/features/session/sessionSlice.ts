import { createAppSlice } from "@sbssrc/app/createAppSlice";
import { KLedgerTypeSession } from "@sbssrc/utils/commonConstants";
import {
    DetailLevelStorageSet,
    GetFeatureInitialState,
    InitSubFeature,
    MakeErrorPayload,
    SetFeatureThunkStateFulfilled,
    SetFeatureThunkStatePending,
    SetFeatureThunkStateRejected,
} from "@sbssrc/utils/commonFunctions";
import {
    CommonDetailLevel,
    FeatureSliceState,
    ISbsFactPutType,
    ISbsFactType,
    ISbsSessionType,
    QueryParamsType,
    QueryResponseApiType,
} from "@sbssrc/utils/commonTypes";
import { PayloadAction } from "@reduxjs/toolkit";
import { sbsFactGet, sbsFactPatch, sbsSessionsGet } from "./sessionApi";

const name: string = KLedgerTypeSession;
const initialState: FeatureSliceState<ISbsSessionType, ISbsFactType> =
    GetFeatureInitialState<ISbsSessionType, ISbsFactType>();

export const sessionSlice = createAppSlice({
    name,
    initialState,
    reducers: create => ({
        actionScanSessionsStreamStart: create.reducer(state => {
            state.loading = true;
            state.scannedSessions = [];
        }),
        actionScanSessionsStreamSuccess: create.reducer(
            (state, action: PayloadAction<string>) => {
                if (action.payload === 'Stream ended') {
                    state.scannedSessions = [];
                    state.loading = false;
                } else {
                    state.scannedSessions = [
                        ...state.scannedSessions.slice(),
                        ...action.payload.split('\n').filter(e => e.length),
                    ].slice(-9);
                }
            }),
        actionScanSessionsStreamError: create.reducer(
            (state, action: PayloadAction<string>) => {
                state.scannedSessions = [];
                console.error(action.payload);
                state.loading = false;
            }),
        actionResetFacts: create.reducer(state => {
            state.currFacts = InitSubFeature<ISbsFactType>();
            state.currFactZoomed = InitSubFeature<ISbsFactType>();
        }),
        actionResetFactZoomed: create.reducer(state => {
            state.currFactZoomed = InitSubFeature<ISbsFactType>();
        }),
        actionSetClearStateResponse: create.reducer(state => {
            state.currSessions.queryResponse.error = MakeErrorPayload();
            state.currFacts.queryResponse.error = MakeErrorPayload();
            state.currFactZoomed.queryResponse.error = MakeErrorPayload();
        }),
        actionSetPagingIncreasingFacts: create.reducer(
            (state, action: PayloadAction<boolean>) => {
                state.currFacts.pagingIncreasing = action.payload;
            },
        ),
        actionSetEditPropertyName: create.reducer((state, actions: PayloadAction<string | null>) => {
            state.editPropertyName = actions.payload;
            state.editPorpertyLabel = (actions.payload ?? "")?.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        }),
        actionSetShowUnformattedDraft: create.reducer((state, actions: PayloadAction<boolean>) => {
            state.showUnformattedDraft = actions.payload;
        }),
        actionSetSilentOpInProgress: create.reducer((state, actions: PayloadAction<boolean>) => {
            state.silentOpInProgress = actions.payload;
        }),
        actionSetDetailLevelFacts: create.reducer(
            (state, action: PayloadAction<CommonDetailLevel>) => {
                state.currFacts.detailLevel = action.payload;

                DetailLevelStorageSet(0, name, action.payload);
            },
        ),
        actionSetQueryParamsSessions: create.reducer(
            (state, action: PayloadAction<Partial<QueryParamsType> | null>) => {
                state.currSessions.queryParams = {
                    ...state.currSessions.queryParams,
                    ...(action.payload as Partial<QueryParamsType>),
                    pagination: {
                        ...state.currSessions.queryParams.pagination,
                        ...action.payload?.pagination,
                    },
                };
            },
        ),
        actionSetQueryParamsFacts: create.reducer(
            (state, action: PayloadAction<Partial<QueryParamsType> | null>) => {
                state.currFacts.queryParams = {
                    ...state.currFacts.queryParams,
                    ...(action.payload as Partial<QueryParamsType>),
                    pagination: {
                        ...state.currFacts.queryParams.pagination,
                        ...action.payload?.pagination,
                    },
                };
            },
        ),
        actionSetQueryParamsFactZoomed: create.reducer(
            (state, action: PayloadAction<Partial<QueryParamsType> | null>) => {
                state.currFactZoomed.queryParams = {
                    ...state.currFactZoomed.queryParams,
                    ...(action.payload as Partial<QueryParamsType>),
                    pagination: {
                        ...state.currFactZoomed.queryParams.pagination,
                        ...action.payload?.pagination,
                    },
                };
            },
        ),
        actionSelectCurrSessions: create.asyncThunk(
            async ({ queryParams }: { queryParams: QueryParamsType; }, { }) => {
                const response = await sbsSessionsGet(queryParams);

                return response;
            },
            {
                pending: (state, payload) => {
                    SetFeatureThunkStatePending(state, state.currSessions, payload);

                    if (state.currSessions.queryParams.pagination?.pageIndex === 0) {
                        state.currFacts = InitSubFeature<ISbsFactType>();
                        state.currFactZoomed = InitSubFeature<ISbsFactType>();
                        state.currSessions.lastId = -1;
                    }
                },
                fulfilled: (state, action) => {
                    const dataNew: ISbsSessionType[] = (action.payload.data as ISbsSessionType[]) ?? [];
                    const dataOld: ISbsSessionType[] = state.currSessions.lastId ? [] :
                        [...((state.currSessions.queryResponse.data as ISbsSessionType[]) ?? [])].filter(e =>
                            !dataNew.find(e2 => e2.id === e.id)
                        );
                    const payload: QueryResponseApiType<ISbsSessionType> = {
                        ...action.payload,
                        data: [...dataOld, ...dataNew],
                    };
                    SetFeatureThunkStateFulfilled(state, state.currSessions, payload);
                },
                rejected: (state, action) => {
                    SetFeatureThunkStateRejected(state, state.currSessions, action);
                },
            },
        ),
        actionSelectCurrFacts: create.asyncThunk(
            async ({ queryParams }: { queryParams: QueryParamsType; }, { }) => {
                const response = await sbsFactGet(queryParams);

                return response;
            },
            {
                pending: (state, payload) => {
                    SetFeatureThunkStatePending(state, state.currFacts, payload);
                    state.currSessions.lastId = payload.meta.arg.queryParams.idToFetch;
                },
                fulfilled: (state, action) => {
                    const dataNew: ISbsFactType[] = (action.payload.data as ISbsFactType[]) ?? [];
                    const dataOld: ISbsFactType[] = [...((state.currFacts.queryResponse.data as ISbsFactType[]) ?? [])].filter(e =>
                        !dataNew.find(e2 => e2.id === e.id)
                    );
                    const pageSize = state.currFacts.queryParams.pagination?.pageSize ?? 10;
                    const pageIndexNew = state.currFacts.queryParams.pagination?.pageIndex ?? 0;
                    const pageIndexOld = state.currFacts.queryResponse.meta?.query_params?.pagination?.page_index ?? 0;
                    const pagingIncreasing: boolean = pageIndexOld < pageIndexNew;
                    const data = pagingIncreasing ? [...dataOld, ...dataNew] : [...dataNew, ...dataOld];
                    const payload: QueryResponseApiType<ISbsFactType> = {
                        ...action.payload,
                        data: pagingIncreasing ? data.slice(-3 * pageSize) : data.slice(0, 3 * pageSize),
                    };
                    SetFeatureThunkStateFulfilled(state, state.currFacts, payload);

                    state.currFacts.lastId = pagingIncreasing ? data[data.length - pageSize]?.id : data[pageSize - 1]?.id;
                    state.silentOpInProgress = false;
                },
                rejected: (state, action) => {
                    SetFeatureThunkStateRejected(state, state.currFacts, action);

                    state.silentOpInProgress = false;
                },
            },
        ),
        actionSelectCurrFactZoomed: create.asyncThunk(
            async ({ queryParams }: { queryParams: QueryParamsType; }, { }) => {
                const response = await sbsFactGet(queryParams);

                return response;
            },
            {
                pending: (state, payload) => {
                    SetFeatureThunkStatePending(state, state.currFactZoomed, payload);
                },
                fulfilled: (state, action) => {
                    SetFeatureThunkStateFulfilled(state, state.currFactZoomed, action.payload);
                    state.currFactZoomed.lastId = action.meta.arg.queryParams?.id2ToFetch;
                },
                rejected: (state, action) => {
                    SetFeatureThunkStateRejected(state, action.meta?.arg.queryParams?.id2ToFetch ? state.currFactZoomed : state.currFacts, action);
                    state.currFactZoomed.lastId = 0;
                },
            },
        ),
        actionPatchSession: create.asyncThunk(
            async ({
                queryParams,
                rowToUpsert,
            }: {
                queryParams: QueryParamsType;
                rowToUpsert: ISbsFactPutType;
            }, { }) => {
                const response = await sbsFactPatch(queryParams, rowToUpsert);
                return response;
            },
            {
                pending: (state, payload) => {
                    state.silentOpInProgress = true;

                    SetFeatureThunkStatePending(state, state.currFactZoomed, payload);
                },
                fulfilled: (state, action) => {
                    // Apply patch to current cached data
                    const currFactItem: ISbsFactType = state.currFacts.queryResponse.data?.find(e => e.id === action.meta.arg.queryParams.id2ToFetch) ?? {} as ISbsFactType;
                    const currFactZoomedItem: ISbsFactType = state.currFactZoomed.queryResponse.data?.find(e => e.id === action.meta.arg.queryParams.id2ToFetch) ?? {} as ISbsFactType;

                    currFactItem[action.meta.arg.rowToUpsert.property_name] = action.meta.arg.rowToUpsert.is_numeric ?
                        action.meta.arg.rowToUpsert.property_value_numeric : action.meta.arg.rowToUpsert.property_value;
                    currFactZoomedItem[action.meta.arg.rowToUpsert.property_name] = currFactItem[action.meta.arg.rowToUpsert.property_name];

                    if (action.meta.arg.rowToUpsert.review_date) {
                        currFactItem.review_date = action.meta.arg.rowToUpsert.review_date;
                        currFactZoomedItem.review_date = currFactItem[action.meta.arg.rowToUpsert.review_date];
                    }

                    if (action.meta.arg.rowToUpsert.reviewer) {
                        currFactItem.reviewer = action.meta.arg.rowToUpsert.reviewer;
                        currFactZoomedItem.reviewer = currFactItem[action.meta.arg.rowToUpsert.reviewer];
                    }

                    state.currFacts.queryResponse.data = state.currFacts.queryResponse.data?.map(
                        e => e.id === action.meta.arg.queryParams.id2ToFetch ? currFactItem : e
                    );
                    state.currFactZoomed.queryResponse.data = state.currFactZoomed.queryResponse.data?.map(
                        e => e.id === action.meta.arg.queryParams.id2ToFetch ? currFactZoomedItem : e
                    );
                    SetFeatureThunkStateFulfilled(state, state.currFactZoomed, null);

                    state.silentOpInProgress = false;
                },
                rejected: (state, action) => {
                    SetFeatureThunkStateRejected(state, state.currFactZoomed, action);

                    state.silentOpInProgress = false;
                },
            },
        ),
    }),
    selectors: {
        selectUpsertState: state => state.currFactZoomed.upsertState,
        selectSessionIsLoading: state => state.loading,
        // selectDetailLevelA: state => state.detailLevel,
        selectGetQueryParamscurrSessions: state => state.currSessions.queryParams,
        selectGetQueryParamsCurrFacts: state => state.currFacts.queryParams,
        selectGetQueryParamscurrFactZoomed: state => state.currFactZoomed.queryParams,
        selectLastIdSessions: state => state.currSessions.lastId,
        selectLastIdFacts: state => state.currFacts.lastId,
        selectLastIdFactZoomed: state => state.currFactZoomed.lastId,
        selectPagingIncreasing: state => state.currFacts.pagingIncreasing,
        selectResponseCurrSessions: state => state.currSessions.queryResponse,
        selectResponseCurrFacts: state => state.currFacts.queryResponse,
        selectResponseCurrFactZoomed: state => state.currFactZoomed.queryResponse,
        selectScannedSessions: state => state.scannedSessions,
        selectEditPropertyName: state => state.editPropertyName,
        selectEditPropertyLabel: state => state.editPorpertyLabel,
        selectShowUnformattedDraft: state => state.showUnformattedDraft,
        selectSilentOpInProgress: state => state.silentOpInProgress,
    },
});

export const {
    actionScanSessionsStreamStart,
    actionScanSessionsStreamSuccess,
    actionScanSessionsStreamError,
    actionResetFacts,
    actionResetFactZoomed,
    actionSetClearStateResponse,
    actionSetPagingIncreasingFacts,
    actionSetEditPropertyName,
    actionSetShowUnformattedDraft,
    actionSetSilentOpInProgress,
    actionSetDetailLevelFacts,
    actionSetQueryParamsSessions,
    actionSetQueryParamsFacts,
    actionSelectCurrSessions,
    actionSelectCurrFacts,
    actionSelectCurrFactZoomed,
    actionPatchSession,
} = sessionSlice.actions;
export const {
    selectUpsertState,
    selectSessionIsLoading,
    selectGetQueryParamscurrSessions,
    selectGetQueryParamsCurrFacts,
    selectGetQueryParamscurrFactZoomed,
    selectLastIdSessions,
    selectLastIdFacts,
    selectLastIdFactZoomed,
    selectPagingIncreasing,
    selectResponseCurrSessions,
    selectResponseCurrFacts,
    selectResponseCurrFactZoomed,
    selectScannedSessions,
    selectEditPropertyName,
    selectEditPropertyLabel,
    selectShowUnformattedDraft,
    selectSilentOpInProgress,
} = sessionSlice.selectors;
