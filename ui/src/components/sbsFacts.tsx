import FormatClearIcon from '@mui/icons-material/FormatClear';
import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { ISbsFactPutType, ISbsFactType, ISbsSessionType, QueryResponseType } from "@sbssrc/utils/commonTypes";
import { Box, Stack } from "@mui/system";
import react, { forwardRef, useEffect } from "react";
import SbsButton from './sbsButton';
import SbsToggle from './sbsToggle';
import SbsFactCellEdit from './sbsFactCellEdit';
import SbsFactRow from './sbsFactRow';
import { UseSbsStyles } from './sbsStyledCtls';
import SbsBoundaryMarker from './sbsBoundaryMarker';

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
const SbsFacts = forwardRef((
    {
        height,
        showSessions,
        currFacts,
        currFactZoomed,
        currSessionZoomed,
        pagingState,
        setPagingState,
        factPatchCb,
        zoomed,
        zoomCb,
        editPropertyName,
        setEditPropertyName,
        editPropertyLabel,
        showUnformattedDraft,
        setShowUnformattedDraft,
    }: {
        height: number;
        showSessions: () => void;
        currFacts: QueryResponseType<ISbsFactType>;
        currFactZoomed: QueryResponseType<ISbsFactType>;
        currSessionZoomed: ISbsSessionType | undefined;
        pagingState: number;
        setPagingState: (value: number) => void;
        factPatchCb: (id: number, payload: ISbsFactPutType) => void;
        zoomed: boolean;
        zoomCb: (id: number) => void;
        editPropertyName: string | null;
        editPropertyLabel: string;
        setEditPropertyName: (newName: string | null) => void;
        showUnformattedDraft: boolean;
        setShowUnformattedDraft: (newState: boolean) => void;
    }
    , ref: react.ForwardedRef<HTMLDivElement>
) => {
    const classes = UseSbsStyles();
    const [rowRefs, setRowRefs] = react.useState<React.RefObject<HTMLTableRowElement>[]>([]);
    const bringIntoViewCb = (idx: number) => {
        const zoomRefStart: React.RefObject<HTMLTableRowElement> | null = idx < rowRefs.length ? rowRefs[idx] : null;
        const zoomRefEnd: React.RefObject<HTMLTableRowElement> | null = idx + 1 < rowRefs.length ? rowRefs[idx + 1] : null;

        console.log("bringIntoViewCb", idx, zoomRefStart, zoomRefEnd);

        if (zoomRefEnd?.current) {
            setTimeout(() => {
                console.log("END Scrolling into view");
                zoomRefEnd?.current?.scrollIntoView({ behavior: 'instant', block: 'end', inline: 'nearest' });

                if (zoomRefStart?.current) {
                    setTimeout(() => {
                        console.log("START Scrolling into view");
                        zoomRefStart?.current?.scrollIntoView({ behavior: 'instant', block: 'start', inline: 'nearest' });
                        zoomRefStart?.current?.parentElement?.parentElement?.parentElement?.scrollBy(0, -40);
                    }, 100);
                }
            }, 100);
        }
    };
    useEffect(() => {
        setRowRefs(currFacts?.data?.map(() => react.createRef()) || []);
    }, [currFacts?.data]);

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
            <Stack ref={ref} spacing={2}
                style={{
                    height,
                    width: "100%",
                    overflow: 'auto',
                    padding: '6px 0 0 0'
                }}
            >
                <Box sx={{ padding: "0 16px", backgroundColor: "lavenderblush" }}>
                    Fact Count: <strong>{currFacts?.meta?.row_count}</strong> -- Session: <strong>{currFacts?.meta?.query_params?.global_filter}</strong>
                    <SbsButton caption="View Session List" style={{ float: "right" }} clicktCb={showSessions} />
                </Box>
                <TableContainer component={Paper} className={classes.tableContainer} style={{ width: '100%', margin: 'auto', height: `${height}px`, }}>
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
                                            position: 'relative',
                                            top: '0px',
                                            right: '0px',
                                            margin: '0 0 0 8px',
                                        }}
                                        clicktCb={(newValue: boolean, arg?: string | number) => {
                                            setShowUnformattedDraft(newValue);
                                        }}
                                    >
                                        <FormatClearIcon />
                                    </SbsToggle>
                                </TableCell>
                                <TableCell className={classes.compactCell2}>Review</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
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
                                        ref={rowRefs[idx]}
                                        height={height}
                                        currFactZoomed={currFactZoomed}
                                        factPatchCb={factPatchCb}
                                        zoomCb={zoomCb}
                                        fact={fact}
                                        idx={idx}
                                        editPropertyName={editPropertyName}
                                        setEditPropertyName={setEditPropertyName}
                                        showUnformattedDraft={showUnformattedDraft}
                                        bringIntoViewCb={bringIntoViewCb}
                                    />
                                    {idx === (currFacts?.data?.length ?? 0) - 1 ?
                                        <SbsPagingMarker isTop={false} idx={idx} pagingState={pagingState} setPagingState={setPagingState} /> : null
                                    }
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack >
        </>
    );
});

export default SbsFacts;