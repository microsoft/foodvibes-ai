import { useAppDispatch, useAppSelector } from "@foodvibes/app/hooks";
import styles from "@foodvibes/components/FvCommon.module.css";
import { useEffect, useState } from "react";
import {
    NowTimestamp,
    QueryParamsCompareToQueryParamsApi,
    QueryParamsInit
} from "@foodvibes/utils/commonFunctions";
import {
    default as CommonMessageSend,
} from "@foodvibes/utils/commonMessageSend";
import {
    CommonError,
    ILayoutTracker,
    ISbsFactPutType,
    ISbsFactType,
    ISbsSessionType,
    QueryParamsType,
    QueryResponseType
} from "@foodvibes/utils/commonTypes";
import { Box, Button, Stack, TextField } from "@mui/material";
import {
    actionSelectCurrFacts,
    actionSetPagingIncreasingFacts,
    actionSetQueryParamsFacts,
    actionPatchProduct,
    selectPagingIncreasing,
    selectGetQueryParamsCurrFacts,
    selectProductIsLoading,
    selectResponseCurrFacts,
    actionSetClearStateResponse,
    actionSelectCurrSessions,
    selectResponseCurrFactZoomed,
    selectResponseCurrSessions,
    actionSetQueryParamsSessions,
    actionResetFacts,
    selectLastIdFacts,
    selectLastIdFactZoomed,
    selectLastIdSessions,
} from "./productSlice";
import { useOutletContext } from "react-router";
import FvBoundaryMarker from "@foodvibes/components/FvBoundaryMarker";
import SbsSessions from "@foodvibes/components/sbsSessions";
import SbsFacts from "@foodvibes/components/sbsFacts";

export const Product = () => {
    const context = useOutletContext<{ outletTracker: ILayoutTracker, titleTracker: ILayoutTracker, bodyTracker: ILayoutTracker }>();
    const dispatch = useAppDispatch();
    // const isLoading: boolean = useAppSelector(selectProductIsLoading);
    // const pagingIncreasing: boolean = useAppSelector(selectPagingIncreasing);
    const lastIdSessions: number = useAppSelector(selectLastIdSessions);
    const lastIdFacts: number = useAppSelector(selectLastIdFacts);
    const lastIdFactZoomed: number = useAppSelector(selectLastIdFactZoomed);
    const queryParamsCurrFacts: QueryParamsType = useAppSelector(selectGetQueryParamsCurrFacts);
    // const setPagingIncreasing: (doLoad: boolean) => void = (doLoad: boolean) => dispatch(actionSetPagingIncreasing(doLoad));
    const resetFacts = () => dispatch(actionResetFacts());
    const setQueryParamsCurrSessions = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParamsSessions(payload));
    const setQueryParamsCurrFacts = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParamsFacts(payload));
    const queryResponseCurrSessions: QueryResponseType<ISbsSessionType> = useAppSelector(selectResponseCurrSessions);
    const queryResponseCurrFacts: QueryResponseType<ISbsFactType> = useAppSelector(selectResponseCurrFacts);
    const queryResponseCurrFactZoomed: QueryResponseType<ISbsFactType> = useAppSelector(selectResponseCurrFactZoomed);
    const selectCurrSessions = (queryParams: QueryParamsType) => dispatch(actionSelectCurrSessions({ queryParams }));
    const selectCurrFacts = (queryParams: QueryParamsType) => dispatch(actionSelectCurrFacts({ queryParams }));
    const patchFact = (queryParams: QueryParamsType, rowToUpsert: ISbsFactPutType) => dispatch(actionPatchProduct({ queryParams, rowToUpsert }));
    const [pagingStateSessions, setPagingStateSessions] = useState<number>(0);
    const [pagingStateFacts, setPagingStateFacts] = useState<number>(0);
    const [doLoadSessions, setDoLoadSessions] = useState<boolean>(false);
    const [doLoadFacts, setDoLoadFacts] = useState<boolean>(false);
    const handleSessionSelection = (idToFetch: number) => {
        setPagingStateFacts(0);
        setDoLoadFacts(false);
        selectCurrFacts(QueryParamsInit({
            idToFetch,
            id2ToFetch: 0,
            globalFilter: "",
            includeDetails: false,
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        }));
    };
    const handlePageChange = (increasing: boolean) => {
        if (!queryResponseCurrFacts?.meta?.row_count) {
            return;
        }

        const pageIndex = increasing ?
            Math.min(
                Math.round((queryResponseCurrFacts.meta?.row_count ?? 0) / (queryResponseCurrFacts.meta?.query_params?.pagination?.page_size ?? 1)),
                (queryResponseCurrFacts.meta?.query_params?.pagination?.page_index ?? 0) + 1) :
            Math.max(0, (queryResponseCurrFacts.meta?.query_params?.pagination?.page_index ?? 0) - 1);

        selectCurrFacts({
            ...queryParamsCurrFacts,
            id2ToFetch: 0,
            pagination: {
                ...queryParamsCurrFacts.pagination,
                pageIndex,
            },
        });
    };
    // Hooks
    useEffect(() => {
        // Component dismount hook to clean the state's response error
        return () => {
            dispatch(actionSetClearStateResponse());
        };
    }, []);
    useEffect(() => {
        if (!queryResponseCurrFacts?.error?.message?.length) {
            return;
        }

        CommonMessageSend(dispatch, queryResponseCurrFacts?.error as CommonError);
    }, [queryResponseCurrFacts?.error]);
    useEffect(() => {
        setQueryParamsCurrFacts({
            globalFilter: queryResponseCurrFacts?.meta?.query_params?.global_filter,
            includeDetails: queryResponseCurrFacts?.meta?.query_params?.include_details,
            pagination: {
                pageIndex: queryResponseCurrFacts?.meta?.query_params?.pagination?.page_index ?? 0,
                pageSize: queryResponseCurrFacts?.meta?.query_params?.pagination?.page_size ?? 10,
            },
        });
    }, [queryResponseCurrFacts?.data, queryResponseCurrFacts?.meta?.query_params]);
    useEffect(() => {
        if (pagingStateSessions === 0 || !queryResponseCurrSessions?.meta?.row_count) {
            return;
        }

        if (!doLoadSessions) {
            setDoLoadSessions(true);
        } else {
            handlePageChange(pagingStateSessions > 0);
            setPagingStateSessions(0);
        }
    }, [doLoadSessions, pagingStateSessions, queryResponseCurrSessions?.meta?.row_count]);
    useEffect(() => {
        if (pagingStateFacts === 0 || !queryResponseCurrFacts?.meta?.row_count) {
            return;
        }

        if (!doLoadFacts) {
            setDoLoadFacts(true);
        } else {
            handlePageChange(pagingStateFacts > 0);
            setPagingStateFacts(0);
        }
    }, [doLoadFacts, pagingStateFacts, queryResponseCurrFacts?.meta?.row_count]);
    useEffect(() => {
        setPagingStateSessions(0);
        setDoLoadSessions(false);
        selectCurrSessions(QueryParamsInit({
            idToFetch: 0,
            id2ToFetch: 0,
            globalFilter: "",
            includeDetails: false,
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        }));
    }, []);

    return (
        <>
            {queryResponseCurrFacts?.data ?
                <SbsFacts
                    ref={context.bodyTracker.ref}
                    height={`${context.outletTracker.height}px`}
                    showSessions={() => {
                        resetFacts();
                    }}
                    currFacts={queryResponseCurrFacts} scoreChangeCb={(id: number, score: number): void => {
                        const rowToUpsert: ISbsFactPutType = {
                            score,
                            reviewer: "Reviewer Name",
                            review_date: NowTimestamp(),
                        };

                        patchFact(QueryParamsInit({
                            idToFetch: lastIdSessions,
                            id2ToFetch: id,
                            globalFilter: "",
                            includeDetails: false,
                            pagination: {
                                pageIndex: 0,
                                pageSize: 10,
                            },
                        }), rowToUpsert);
                    }}
                    currSessionZoomed={queryResponseCurrSessions?.data?.find(e => e.id === lastIdSessions)}
                    pagingState={0}
                    setPagingState={(value: number): void => {
                        setPagingStateFacts(value);
                    }}
                />
                :
                <SbsSessions
                    ref={context.titleTracker.ref}
                    height={`${context.outletTracker.height}px`}
                    currSession={queryResponseCurrSessions}
                    pagingState={0}
                    setPagingState={(value: number): void => {
                        setPagingStateSessions(value);
                    }}
                    selectCb={(id: number) => {
                        handleSessionSelection(id);
                    }}
                />
            }
        </>
    );
};
