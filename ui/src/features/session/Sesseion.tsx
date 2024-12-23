import { useAppDispatch, useAppSelector } from "@sbssrc/app/hooks";
import { useEffect, useState } from "react";
import {
    NowTimestamp,
    QueryParamsInit
} from "@sbssrc/utils/commonFunctions";
import {
    default as CommonMessageSend,
} from "@sbssrc/utils/commonMessageSend";
import {
    CommonError,
    ILayoutTracker,
    ISbsFactPutType,
    ISbsFactType,
    ISbsSessionType,
    QueryParamsType,
    QueryResponseType
} from "@sbssrc/utils/commonTypes";
import { Box } from "@mui/material";
import {
    actionSelectCurrFacts,
    actionSetQueryParamsFacts,
    actionPatchSession,
    selectGetQueryParamsCurrFacts,
    selectResponseCurrFacts,
    actionSetClearStateResponse,
    actionSelectCurrSessions,
    selectResponseCurrFactZoomed,
    selectResponseCurrSessions,
    actionSetQueryParamsSessions,
    actionResetFacts,
    selectLastIdFactZoomed,
    selectLastIdSessions,
    actionSelectCurrFactZoomed,
    actionResetFactZoomed,
    selectGetQueryParamscurrSessions,
    selectScannedSessions,
    selectShowUnformattedDraft,
    actionSetShowUnformattedDraft,
    actionSetEditPropertyName,
    selectEditPropertyName,
    selectEditPropertyLabel,
} from "./sessionSlice";
import { useOutletContext } from "react-router";
import SbsSessions from "@sbssrc/components/SbsSessions";
import SbsFacts from "@sbssrc/components/SbsFacts";
import StreamData from "./SessionScan";

export const Session = () => {
    const context = useOutletContext<{ outletTracker: ILayoutTracker, titleTracker: ILayoutTracker, bodyTracker: ILayoutTracker }>();
    const dispatch = useAppDispatch();
    const lastIdSessions: number = useAppSelector(selectLastIdSessions);
    const lastIdFactZoomed: number = useAppSelector(selectLastIdFactZoomed);
    const queryParamsCurrSessions: QueryParamsType = useAppSelector(selectGetQueryParamscurrSessions);
    const queryParamsCurrFacts: QueryParamsType = useAppSelector(selectGetQueryParamsCurrFacts);
    const scannedSessions: string[] = useAppSelector(selectScannedSessions);
    const editPropertyName: string | null = useAppSelector(selectEditPropertyName);
    const editPropertyLabel: string = useAppSelector(selectEditPropertyLabel);
    const showUnformattedDraft: boolean = useAppSelector(selectShowUnformattedDraft);
    // const setPagingIncreasing: (doLoad: boolean) => void = (doLoad: boolean) => dispatch(actionSetPagingIncreasing(doLoad));
    const setEditPropertyName = (newName: string | null) => dispatch(actionSetEditPropertyName(newName));
    const setShowUnformattedDraft = (newState: boolean) => dispatch(actionSetShowUnformattedDraft(newState));
    const resetFacts = () => dispatch(actionResetFacts());
    const resetFactZoomed = () => dispatch(actionResetFactZoomed());
    const setQueryParamsCurrSessions = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParamsSessions(payload));
    const setQueryParamsCurrFacts = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParamsFacts(payload));
    const queryResponseCurrSessions: QueryResponseType<ISbsSessionType> = useAppSelector(selectResponseCurrSessions);
    const queryResponseCurrFacts: QueryResponseType<ISbsFactType> = useAppSelector(selectResponseCurrFacts);
    const queryResponseCurrFactZoomed: QueryResponseType<ISbsFactType> = useAppSelector(selectResponseCurrFactZoomed);
    const selectCurrSessions = (queryParams: QueryParamsType) => dispatch(actionSelectCurrSessions({ queryParams }));
    const selectCurrFacts = (queryParams: QueryParamsType) => dispatch(actionSelectCurrFacts({ queryParams }));
    const selectCurrFactZoomed = (queryParams: QueryParamsType) => dispatch(actionSelectCurrFactZoomed({ queryParams }));
    const patchFact = (queryParams: QueryParamsType, rowToUpsert: ISbsFactPutType) => dispatch(actionPatchSession({ queryParams, rowToUpsert }));
    const [pagingStateSessions, setPagingStateSessions] = useState<number>(0);
    const [pagingStateFacts, setPagingStateFacts] = useState<number>(0);
    const [doLoadSessions, setDoLoadSessions] = useState<boolean>(false);
    const [doLoadFacts, setDoLoadFacts] = useState<boolean>(false);
    const [zoomed, setZoomed] = useState<boolean>(false);
    const handleSessionSelection = (path: string) => {
        setPagingStateSessions(0);
        setDoLoadSessions(false);
        selectCurrSessions(QueryParamsInit({
            idToFetch: 0,
            id2ToFetch: 0,
            globalFilter: path,
            includeDetails: false,
            pagination: {
                pageIndex: 0,
                pageSize: 500,
            },
        }));
    };
    const handleFactSelection = (path: string) => {
        StreamData(dispatch, "sbs_session_load", path);
        setPagingStateFacts(0);
        setDoLoadFacts(false);
        selectCurrFacts(QueryParamsInit({
            idToFetch: 0,
            id2ToFetch: 0,
            globalFilter: path,
            includeDetails: false,
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        }));
    };
    const handlePageChangeIndex = <T,>(increasing: boolean, queryResponse: QueryResponseType<T>): number => {
        if (!queryResponse?.meta?.row_count) {
            return -1;
        }

        const pageIndex = increasing ?
            Math.min(
                Math.round((queryResponse.meta?.row_count ?? 0) / (queryResponse.meta?.query_params?.pagination?.page_size ?? 1)),
                (queryResponse.meta?.query_params?.pagination?.page_index ?? 0) + 1) :
            Math.max(0, (queryResponse.meta?.query_params?.pagination?.page_index ?? 0) - 1);

        return pageIndex;
    };
    const handlePageChangeSessions = (increasing: boolean) => {
        const pageIndex = handlePageChangeIndex(increasing, queryResponseCurrSessions);

        if (pageIndex > -1 && queryParamsCurrSessions.pagination.pageIndex !== pageIndex) {
            selectCurrSessions({
                ...queryParamsCurrSessions,
                id2ToFetch: 0,
                pagination: {
                    ...queryParamsCurrSessions.pagination,
                    pageIndex,
                },
            });
        }
    };
    const handlePageChangeFacts = (increasing: boolean) => {
        const pageIndex = handlePageChangeIndex(increasing, queryResponseCurrFacts);

        if (pageIndex > -1 && queryParamsCurrFacts.pagination.pageIndex !== pageIndex) {
            selectCurrFacts({
                ...queryParamsCurrFacts,
                id2ToFetch: 0,
                pagination: {
                    ...queryParamsCurrFacts.pagination,
                    pageIndex,
                },
            });
        }
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
            handlePageChangeSessions(pagingStateSessions > 0);
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
            handlePageChangeFacts(pagingStateFacts > 0);
            setPagingStateFacts(0);
        }
    }, [doLoadFacts, pagingStateFacts, queryResponseCurrFacts?.meta?.row_count]);
    useEffect(() => {
        console.log("lastIdFactZoomed", lastIdFactZoomed);
        setZoomed(lastIdFactZoomed ? true : false);
    }, [lastIdFactZoomed]);
    useEffect(() => {
        handleSessionSelection("");
    }, []);

    return (
        <>
            {scannedSessions?.length ?
                <>
                    <Box sx={{
                        display: "block",
                        position: "absolute",
                        width: "156px",
                        height: "200px",
                        bottom: "32px",
                        right: "8px",
                        margin: "0 auto",
                        textAlign: "left",
                        border: "2px solid red",
                        borderRadius: "8px",
                        backgroundColor: "lightyellow",
                        padding: "8px",
                        overflow: "auto",
                        color: "black",
                        zIndex: (theme) => theme.zIndex.drawer + 120,
                    }}>
                        {scannedSessions.map((msg, idx) => (
                            <Box component="div" key={`msg${idx}`} sx={{ display: "flex", borderRadius: "8px", border: 0, }}>{msg}</Box>
                        ))}
                    </Box>
                </>
                : null
            }
            {queryResponseCurrFacts?.data ?
                <SbsFacts
                    ref={context.bodyTracker.ref}
                    height={context.outletTracker.height}
                    showSessions={() => {
                        resetFacts();
                    }}
                    currFacts={queryResponseCurrFacts}
                    currFactZoomed={queryResponseCurrFactZoomed}
                    currSessionZoomed={queryResponseCurrSessions?.data?.find(e => e.id === lastIdSessions)}
                    pagingState={0}
                    setPagingState={(value: number): void => {
                        setPagingStateFacts(value);
                    }}
                    factPatchCb={(id: number, payload: ISbsFactPutType): void => {
                        patchFact(QueryParamsInit({
                            idToFetch: lastIdSessions,
                            id2ToFetch: id,
                            globalFilter: queryParamsCurrFacts.globalFilter,
                            includeDetails: false,
                            pagination: {
                                pageIndex: 0,
                                pageSize: 10,
                            },
                        }), {
                            ...payload,
                            reviewer: "Reviewer Name",
                            review_date: NowTimestamp(),
                        });
                    }}
                    zoomed={zoomed}
                    zoomCb={(id: number): void => {
                        if (id) {
                            selectCurrFactZoomed(QueryParamsInit({
                                idToFetch: lastIdSessions,
                                id2ToFetch: id,
                                globalFilter: queryParamsCurrFacts.globalFilter,
                                includeDetails: false,
                                pagination: {
                                    pageIndex: 0,
                                    pageSize: 1,
                                },
                            }));
                        } else {
                            resetFactZoomed();
                        }
                    }}
                    editPropertyName={editPropertyName}
                    setEditPropertyName={setEditPropertyName}
                    editPropertyLabel={editPropertyLabel}
                    showUnformattedDraft={showUnformattedDraft}
                    setShowUnformattedDraft={setShowUnformattedDraft}
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
                    selectCb={(path: string) => {
                        if (path.endsWith(".jsonl")) {
                            handleFactSelection(path);
                        } else {
                            handleSessionSelection(path);
                        }
                    }}
                    refreshCb={() => {
                        // StreamData(dispatch, "sbs_sessions_get");
                    }}
                />
            }
        </>
    );
};
