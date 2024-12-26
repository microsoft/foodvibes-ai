import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { ILayoutTracker, ISbsFactPutType, ISbsFactType, QueryResponseType } from "@sbssrc/utils/commonTypes";
import { Box, Stack } from "@mui/system";
import { createRef, useEffect, useState } from "react";
import SbsToggle from './SbsToggle';
import SbsFactCellEdit from './SbsFactCellEdit';
import SbsFactRow from './SbsFactRow';
import { UseSbsStyles } from './SbsStyledCtls';
import SbsBoundaryMarker from './sbsBoundaryMarker';
import { Button } from '@mui/material';
import SbsDocumentMap from './SbsDocumentMap';

const SbsPagingMarker = (
    {
        isTop,
        idx,
        pagingState,
        setPagingState,
    }: {
        isTop: boolean;
        idx: number;
        pagingState: number;
        setPagingState: (value: number) => void;
    }
) =>
    <SbsBoundaryMarker
        hasComeIntoViewCb={(isInView: boolean) => {
            console.info(`Facts: ${isTop ? 'top' : 'bottom'} is in view`, isInView);

            if (isInView && pagingState === 0) {
                setPagingState(idx === 0 ? -1 : 1);
            }
        }}
    />;
const SbsFacts = (
    {
        refTitleTracker,
        bodyTracker,
        height,
        subHeight,
        showSessions,
        currFacts,
        currFactZoomed,
        lastIdFacts,
        pagingState,
        setPagingState,
        factPatchCb,
        zoomCb,
        editPropertyName,
        setEditPropertyName,
        editPropertyLabel,
        showUnformattedDraft,
        setShowUnformattedDraft,
    }: {
        refTitleTracker: React.RefObject<HTMLDivElement>;
        bodyTracker: ILayoutTracker;
        height: number;
        subHeight: number;
        showSessions: () => void;
        currFacts: QueryResponseType<ISbsFactType>;
        currFactZoomed: QueryResponseType<ISbsFactType>;
        lastIdFacts: number;
        pagingState: number;
        setPagingState: (value: number) => void;
        factPatchCb: (id: number, payload: ISbsFactPutType) => void;
        zoomCb: (id: number) => void;
        editPropertyName: string | null;
        editPropertyLabel: string;
        setEditPropertyName: (newName: string | null) => void;
        showUnformattedDraft: boolean;
        setShowUnformattedDraft: (newState: boolean) => void;
    }
) => {
    const classes = UseSbsStyles();
    const [rowRefs, setRowRefs] = useState<{ [key: number]: React.RefObject<HTMLTableRowElement> }>({});
    const [zoomInProgress, setZoomInProgress] = useState<boolean>(false);
    const bringIntoViewCb = (id: number) => {
        if (zoomInProgress) {
            setZoomInProgress(false);

            return;
        }
        const zoomRefStart: React.RefObject<HTMLTableRowElement> | null = rowRefs[id];

        console.log("@@@@@bringIntoViewCb", id, zoomRefStart);

        if (zoomRefStart?.current) {
            setTimeout(() => {
                console.log("START Scrolling into view");
                if (zoomRefStart?.current) {
                    zoomRefStart.current.scrollIntoView({ behavior: 'instant', block: 'start', inline: 'nearest' });
                    zoomRefStart.current.parentElement?.parentElement?.parentElement?.scrollBy(0, -40);
                }
            }, 100);
        }
    };
    useEffect(() => {
        const newRefs: { [key: number]: React.RefObject<HTMLTableRowElement> } = {};

        currFacts?.data?.forEach((fact: ISbsFactType) => {
            newRefs[fact.id] = createRef<HTMLTableRowElement>();
        });
        setRowRefs(newRefs);
        console.log("@@@@@SbsFacts: newRefs", newRefs);
    }, [currFacts?.data]);

    useEffect(() => {
        if (lastIdFacts && currFacts?.data?.find((fact: ISbsFactType) => fact.id === lastIdFacts) && rowRefs[lastIdFacts]?.current) {
            console.log("@@@@@SbsFacts: lastIdFacts", lastIdFacts);
            bringIntoViewCb(lastIdFacts);
        }
    }, [lastIdFacts, currFacts?.data, rowRefs]);

    console.log('height', height);
    console.log('subHeight', subHeight);
    return (
        <>
            {editPropertyName?.length && currFactZoomed?.data?.[0]?.id ?
                <SbsFactCellEdit
                    name={editPropertyName}
                    label={editPropertyLabel}
                    value={currFactZoomed.data[0][editPropertyName]}
                    changeCb={(value: string | null) => {
                        if (value !== null && currFactZoomed?.data?.[0]?.id) {
                            factPatchCb(currFactZoomed?.data?.[0]?.id, {
                                property_name: editPropertyName,
                                property_value: value
                            } as ISbsFactPutType);
                        }

                        setEditPropertyName(null);
                    }}
                />
                : null
            }
            <Stack spacing={2}
                style={{
                    height,
                    width: "100%",
                    overflow: 'auto',
                    padding: '0'
                }}
            >
                <Box ref={refTitleTracker} sx={{ padding: "0 16px 0 0", backgroundColor: "gainsboro", display: "block", verticalAlign: "middle", lineHeight: "28px", }}>
                    <Button
                        title="View Blob List"
                        variant="contained"
                        color="primary"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            float: "left",
                            border: '1px solid white',
                            margin: '0 8px 0 0',
                            fontSize: '10px',
                            minWidth: 'auto',
                            padding: '4px 8px',
                        }}
                        onClick={showSessions}
                    >View Blob List</Button>
                    Blob: <strong>{currFacts?.meta?.query_params?.global_filter}</strong> (Fact Count: <strong>{currFacts?.meta?.row_count}</strong>)
                    {" "}pIdx: {currFacts?.meta?.query_params?.pagination?.page_index}
                    {" "}pSz: {currFacts?.meta?.query_params?.pagination?.page_size}
                    {" "}totalCnt: {currFacts?.meta?.row_count}
                    {" "}currCnt: {currFacts?.data?.length}
                </Box>
                <TableContainer ref={bodyTracker.ref} component={Paper} className={classes.tableContainer} style={{
                    width: 'calc(100vw - 80px)',
                    margin: "0",
                    padding: "0",
                    display: "flex",
                    maxHeight: `${subHeight}px`,
                    minHeight: `${subHeight}px`,
                }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow className={classes.stickyHeader}>
                                <TableCell className={classes.compactCell}>Reference</TableCell>
                                <TableCell className={classes.compactCell}>Draft
                                    <SbsToggle
                                        title={showUnformattedDraft ? "Unformatted view. Click to show Formatted Draft." : "Formatted view. Click to Show Unformatted Draft."}
                                        selected={showUnformattedDraft}
                                        style={{
                                            cursor: 'pointer',
                                            margin: '0 0 0 8px',
                                        }}
                                        clicktCb={(newValue: boolean, arg?: string | number) => {
                                            setShowUnformattedDraft(newValue);
                                        }}
                                    >
                                        <FormatClearIcon />
                                    </SbsToggle>
                                </TableCell>
                                <TableCell className={classes.compactCell2}>
                                    Review
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <>
                                {(currFacts?.data?.map((fact: ISbsFactType) => (
                                    fact.id === currFactZoomed?.data?.[0].id
                                        ? ({
                                            ...fact,
                                            document_text_reference: currFactZoomed?.data[0].document_text_reference,
                                            draft: currFactZoomed?.data[0].draft,
                                            draft_unjsonified: currFactZoomed?.data[0].draft_unjsonified,
                                        }) : fact
                                )))?.map((fact: ISbsFactType, idx: number) => (
                                    <>
                                        {idx === 0 ?
                                            <SbsPagingMarker isTop={true} idx={idx} pagingState={pagingState} setPagingState={setPagingState} /> : null
                                        }
                                        <SbsFactRow
                                            key={`factRow${idx}`}
                                            ref={rowRefs[fact.id]}
                                            height={subHeight}
                                            currFactZoomed={currFactZoomed}
                                            factPatchCb={factPatchCb}
                                            zoomCb={zoomCb}
                                            fact={fact}
                                            idx={idx}
                                            editPropertyName={editPropertyName}
                                            setEditPropertyName={setEditPropertyName}
                                            showUnformattedDraft={showUnformattedDraft}
                                            bringIntoViewCb={(id: number) => {
                                                bringIntoViewCb(id);
                                                setZoomInProgress(false);
                                            }}
                                        />
                                        {idx === (currFacts?.data?.length ?? 0) - 1 ?
                                            <SbsPagingMarker isTop={false} idx={idx} pagingState={pagingState} setPagingState={setPagingState} /> : null
                                        }
                                    </>
                                ))}
                            </>
                        </TableBody>
                    </Table>
                </TableContainer>
                <div style={{
                    margin: "0",
                    padding: "0",
                    display: "flex",
                    width: "80px",
                    maxHeight: `${subHeight}px`,
                    minHeight: `${subHeight}px`,
                    backgroundColor: "lavenderblush",
                    position: "absolute",
                    right: "0",
                    bottom: "0",
                }}>
                    <SbsDocumentMap
                        tag="Fact #"
                        rowIdBeg={currFacts?.data?.length ? currFacts.data[0].id - 1 : 0}
                        rowIdEnd={currFacts?.data?.length ? currFacts.data[currFacts?.data?.length - 1].id - 1 : 0}
                        max={currFacts?.meta?.row_count ?? 0}
                        height={`${subHeight}px`}
                        changeCb={(pageIdx: number) => {
                            console.log("pageIdx", pageIdx);
                        }}
                    />
                </div>
            </Stack >
        </>
    );
};

export default SbsFacts;