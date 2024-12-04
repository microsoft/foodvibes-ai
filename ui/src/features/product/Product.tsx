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
    QueryParamsType,
    QueryResponseType
} from "@foodvibes/utils/commonTypes";
import { Box, Button, Stack, TextField } from "@mui/material";
import {
    actionSelectProduct,
    actionSetPagingIncreasing,
    actionSetQueryParams,
    actionUpsertProduct,
    selectPagingIncreasing,
    selectGetQueryParams,
    selectProductIsLoading,
    selectProductResponse,
    setClearStateResponse,
} from "./productSlice";
import SbsFact from "@foodvibes/components/sbsFact";
import { useOutletContext } from "react-router";
import FvBoundaryMarker from "@foodvibes/components/FvBoundaryMarker";

export const Product = () => {
    const context = useOutletContext<{ outletTracker: ILayoutTracker, titleTracker: ILayoutTracker, bodyTracker: ILayoutTracker }>();
    const dispatch = useAppDispatch();
    // const isLoading: boolean = useAppSelector(selectProductIsLoading);
    // const pagingIncreasing: boolean = useAppSelector(selectPagingIncreasing);
    const queryParams: QueryParamsType = useAppSelector(selectGetQueryParams);
    // const setPagingIncreasing: (doLoad: boolean) => void = (doLoad: boolean) => dispatch(actionSetPagingIncreasing(doLoad));
    const setQueryParams = (payload: Partial<QueryParamsType>) => dispatch(actionSetQueryParams(payload));
    const queryResponse: QueryResponseType<ISbsFactType> = useAppSelector(selectProductResponse,);
    const selectProduct = (queryParams: QueryParamsType) => dispatch(actionSelectProduct({ queryParams }));
    const upsertProduct = (queryParams: QueryParamsType, rowToUpsert: ISbsFactPutType) => dispatch(actionUpsertProduct({ queryParams, rowToUpsert }));
    const [textValue, setTextValue] = useState<string>('data/cfca7fd0-a03f-4305-b48d-fd2ace8bb332.jsonl');
    const [pagingState, setPagingState] = useState<number>(0);
    const [doLoad, setDoLoad] = useState<boolean>(false);
    const handleButtonClick = () => {
        if (textValue.trim().length) {
            setPagingState(0);
            setDoLoad(false);
            selectProduct(QueryParamsInit({
                globalFilter: textValue,
                includeDetails: false,
                pagination: {
                    pageIndex: 0,
                    pageSize: 10,
                },
            }));
        }
    };
    const handlePageChange = (increasing: boolean) => {
        const pageIndex = increasing ?
            Math.min(
                Math.round((queryResponse.meta?.row_count ?? 0) / (queryResponse.meta?.query_params?.pagination?.page_size ?? 1)),
                (queryResponse.meta?.query_params?.pagination?.page_index ?? 0) + 1) :
            Math.max(0, (queryResponse.meta?.query_params?.pagination?.page_index ?? 0) - 1);

        selectProduct({
            ...queryParams,
            pagination: {
                ...queryParams.pagination,
                pageIndex,
            },
        });
    };
    // Hooks
    useEffect(() => {
        // Component dismount hook to clean the state's response error
        return () => {
            dispatch(setClearStateResponse());
        };
    }, []);
    useEffect(() => {
        if (!queryResponse?.error?.message?.length) {
            return;
        }

        CommonMessageSend(dispatch, queryResponse?.error as CommonError);
    }, [queryResponse?.error]);
    useEffect(() => {
        setQueryParams({
            globalFilter: queryResponse?.meta?.query_params?.global_filter,
            includeDetails: queryResponse?.meta?.query_params?.include_details,
            pagination: {
                pageIndex: queryResponse?.meta?.query_params?.pagination?.page_index ?? 0,
                pageSize: queryResponse?.meta?.query_params?.pagination?.page_size ?? 10,
            },
        });
    }, [queryResponse?.data, queryResponse?.meta?.query_params]);
    useEffect(() => {
        if (pagingState === 0 || !queryResponse?.meta?.row_count) {
            return;
        }

        if (!doLoad) {
            setDoLoad(true);
        } else {
            handlePageChange(pagingState > 0);
            setPagingState(0);
        }
    }, [doLoad, pagingState, queryResponse?.meta?.row_count]);

    return (
        <>
            <Box ref={context.titleTracker.ref} className={styles.row} style={{ padding: '9px 0 0 0' }}
            >
                <TextField
                    label="Enter text"
                    fullWidth
                    value={textValue}
                    onChange={(e) => {
                        setDoLoad(false);
                        setTextValue(e.target.value);
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleButtonClick}
                >
                    Review
                </Button>
            </Box>
            <Stack ref={context.bodyTracker.ref} spacing={2}
                style={{
                    maxHeight: `${context.outletTracker.height - context.titleTracker.height - 1}px`,
                    minHeight: `${context.outletTracker.height - context.titleTracker.height - 1}px`,
                    width: "100%",
                    overflow: 'auto',
                    padding: '6px 0 0 0'
                }}
            >
                {/* <FvBoundaryMarker hasComeIntoViewCb={(isInView: boolean) => {
                    console.info('isInViewTop', isInView);

                    if (isInView && pagingState === 0) {
                        setPagingState(-1);
                    }
                }} /> */}
                {queryResponse?.data?.map((fact: ISbsFactType, idx: number) => (
                    <SbsFact key={`fact${idx}`} sbsFact={fact} scoreChangeCb={(newScore: number) => {
                        const rowToUpsert: ISbsFactPutType = {
                            id: fact.id,
                            score: newScore,
                            reviewer: "Reviewer Name",
                            review_date: NowTimestamp(),
                        };

                        upsertProduct(queryParams, rowToUpsert);
                    }} />
                ))}
                <FvBoundaryMarker hasComeIntoViewCb={(isInView: boolean) => {
                    console.info('isInViewBottom', isInView);

                    if (isInView && pagingState === 0) {
                        setPagingState(1);
                    }
                }} />
            </Stack>
        </>
    );
};
