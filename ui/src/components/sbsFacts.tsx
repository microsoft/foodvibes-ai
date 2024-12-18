import FormatClearIcon from '@mui/icons-material/FormatClear';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import { FormControl, InputLabel, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@material-ui/core";
import { ISbsFactPutType, ISbsFactType, ISbsSessionType, QueryResponseType } from "@foodvibes/utils/commonTypes";
import { Box, Stack, styled } from "@mui/system";
import FvBoundaryMarker from "./FvBoundaryMarker";
import react, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import SbsButton from './sbsButton';
import SbsToggle from './sbsToggle';
import SbsSliderButtons from './sbsSliderButtons';
import { KScoreLableAc, KScoreLableAcShort, KScoreLableCl, KScoreLableClShort, KScoreLableCn, KScoreLableCnShort, KScoreLableCp, KScoreLableCpShort, KScoreLableCr, KScoreLableCrShort } from '@foodvibes/utils/commonConstants';

const KLineHeight = 16;
const useStyles = makeStyles({
    tableContainer: {
        // maxHeight: 440,
    },
    stickyHeader: {
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 2,
    },
    compactRow: {
        height: 24,
        verticalAlign: 'top',
    },
    compactCell: {
        padding: '4px 8px',
        width: '40%',
    },
    compactCell2: {
        padding: '4px 8px',
        width: "360px",
    },
    compactNumericCell: {
        padding: '4px 8px',
        textAlign: 'right',
    },
    customOutlinedInputRoot: {
        "& fieldset": {
            borderColor: "#1976d2",
            fontSize: "0.75rem",
        },
        "&:hover fieldset": {
            borderColor: "#115293",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#0d47a1",
        },
    },
});
const CompactTableRow = styled(TableRow)({
    verticalAlign: 'top',
    // height: '36px',
    overflow: 'auto',
});
const CompactTableCell0 = styled(TableCell)({
    padding: '6px 8px 0',
    fontSize: '0.875rem',
    verticalAlign: 'top',
    fontWeight: 'semi-bold',
    fontStyle: 'italic',
    position: 'sticky',
    left: 0,
    background: '#fff', // Ensure the background is set to avoid overlap issues
    zIndex: 1, // Ensure it stays above other cells
});
const CompactTableCell = styled(TableCell)({
    padding: '6px 8px 0',
    fontSize: '0.875rem',
    verticalAlign: 'top',
    whiteSpace: "nowrap",
    overflow: "auto",
});
const getPayloadToPut = (fact: ISbsFactType, scores: ISbsFactPutType) => ({
    score_correctness: scores.score_correctness ?? fact.score_correctness,
    score_completeness: scores.score_completeness ?? fact.score_completeness,
    score_clarity: scores.score_clarity ?? fact.score_clarity,
    score_accuracy: scores.score_accuracy ?? fact.score_accuracy,
    score_consistency: scores.score_consistency ?? fact.score_consistency,
    reviewer: scores.reviewer ?? fact.reviewer,
    review_date: scores.review_date ?? fact.review_date,
} as ISbsFactPutType
);
const ReviewTable = (
    { data }: { data: ISbsFactType }
) => (
    <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
                <CompactTableRow>
                    <CompactTableCell><strong>Field</strong></CompactTableCell>
                    <CompactTableCell><strong>Value</strong></CompactTableCell>
                </CompactTableRow>
            </TableHead>
            <TableBody>
                {Object.entries(data).filter(([key, value]) =>
                    ![
                        'id',
                        'session_id',
                        'score_correctness',
                        'score_completeness',
                        'score_clarity',
                        'score_accuracy',
                        'score_consistency',
                        'score_relevance',
                        'document_text_reference',
                        'draft'
                    ].find(e => e === key)).map(([key, value]) => (
                        <CompactTableRow key={key} style={{ height: "36px" }}>
                            <CompactTableCell0>{key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</CompactTableCell0>
                            <CompactTableCell>{value}</CompactTableCell>
                        </CompactTableRow>
                    ))}
            </TableBody>
        </Table>
    </TableContainer>
);
const SbsFactScorePicker = (
    {
        fact,
        isHorizontal,
        scoreChangeCb,
    }: {
        fact: ISbsFactType;
        isHorizontal: boolean;
        scoreChangeCb: (id: number, scores: ISbsFactPutType) => void;
    }
) => {
    const sliderConfigs = useMemo(() => [
        {
            defaultValue: Number(fact.score_correctness) || 0,
            captionPrefix: KScoreLableCrShort,
            caption: KScoreLableCr,
            scoreKey: 'score_correctness',
        },
        {
            defaultValue: Number(fact.score_completeness) || 0,
            captionPrefix: KScoreLableCpShort,
            caption: KScoreLableCp,
            scoreKey: 'score_completeness',
        },
        {
            defaultValue: Number(fact.score_clarity) || 0,
            captionPrefix: KScoreLableClShort,
            caption: KScoreLableCl,
            scoreKey: 'score_clarity',
        },
        {
            defaultValue: Number(fact.score_accuracy) || 0,
            captionPrefix: KScoreLableAcShort,
            caption: KScoreLableAc,
            scoreKey: 'score_accuracy',
        },
        {
            defaultValue: Number(fact.score_consistency) || 0,
            captionPrefix: KScoreLableCnShort,
            caption: KScoreLableCn,
            scoreKey: 'score_consistency',
        },
    ], [fact.score_correctness, fact.score_completeness, fact.score_clarity, fact.score_accuracy, fact.score_consistency]);

    return <Box sx={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }}>
        {sliderConfigs.map((config, index) => (
            <SbsSliderButtons
                key={index}
                isHorizontal={isHorizontal}
                defaultValue={config.defaultValue}
                captionPrefix={config.captionPrefix}
                caption={config.caption}
                style={{ margin: '0' }}
                changeCb={(value) => {
                    scoreChangeCb(fact.id, getPayloadToPut(fact, {
                        [config.scoreKey]: value as number,
                    } as ISbsFactPutType));
                }}
            />
        ))}
    </Box>;
};
const SbsFactCell = (
    {
        title,
        body,
        zoomed,
        rowsMax,
        backgroundColor,
    }: {
        title: string;
        body: string;
        zoomed: boolean;
        rowsMax: number;
        backgroundColor: string;
    }
) =>
    <Box sx={{ margin: "6px 0 0", padding: "0px", border: "1px solid #ccc", borderRadius: "8px", }}>
        <FormControl fullWidth variant="outlined">
            <InputLabel
                shrink
                htmlFor="outlined-read-only-input"
                style={{ fontSize: "13px", color: "#1976d2", position: "relative", top: "7px", }}
            >
                {title} -- Chars. {body?.length}{zoomed ? "" : " truncated"}
            </InputLabel>
            <TextField
                id="outlined-read-only-input"
                multiline
                minRows={4}
                maxRows={zoomed ? rowsMax : 4}
                value={body}
                InputProps={{
                    readOnly: true,
                    style: { fontSize: "12px", padding: "4px 8px", color: "black", backgroundColor, lineHeight: `${KLineHeight}px` },
                }}
                variant="standard"
                fullWidth
                classes={{ root: useStyles().customOutlinedInputRoot }}
            />
        </FormControl>
    </Box>
    ;
const SbsFactRow = (
    {
        height,
        currFacts,
        currFactZoomed,
        pagingState,
        setPagingState,
        scoreChangeCb,
        zoomCb,
        fact,
        idx,
        showUnformattedDraft,
    }: {
        height: number;
        currFacts: QueryResponseType<ISbsFactType>;
        currFactZoomed: QueryResponseType<ISbsFactType>;
        pagingState: number;
        setPagingState: (value: number) => void;
        scoreChangeCb: (id: number, scores: ISbsFactPutType) => void;
        zoomCb: (id: number) => void;
        fact: ISbsFactType;
        idx: number;
        showUnformattedDraft: boolean;
    }
) => {
    const classes = useStyles();
    const [rowsMax, setRowsMax] = useState<number>(4);
    const [bringIntoView, setBringIntoView] = useState<boolean>(false);
    const [zoomedCurr, setZoomedCurr] = useState<boolean>(false);
    const zoomRefStart = useRef<HTMLTableRowElement>(null);
    const zoomRefEnd = useRef<HTMLTableRowElement>(null);

    useEffect(() => {
        setRowsMax(Math.floor((height - 200) / KLineHeight));
    }, [height]);
    useEffect(() => {
        setZoomedCurr(fact.id && fact.id === currFactZoomed?.data?.[0].id ? true : false);
    }, [fact.id === currFactZoomed?.data?.[0].id]);
    useEffect(() => {
        if (bringIntoView && zoomRefStart.current && zoomRefEnd.current) {
            console.log("Scrolling into view", bringIntoView, zoomRefStart.current, zoomRefEnd.current);
            setBringIntoView(false);
            setTimeout(() => {
                console.log("START Scrolling into view");
                zoomRefStart?.current?.scrollIntoView({ behavior: 'instant', block: 'start', inline: 'nearest' });

                setTimeout(() => {
                    console.log("END Scrolling into view");
                    zoomRefEnd?.current?.scrollIntoView({ behavior: 'instant', block: 'end', inline: 'nearest' });
                }, 100);
            }, 100);
        }
    }, [bringIntoView]);

    return (
        <>
            <span ref={zoomRefStart}></span>
            <TableRow key={`fact${idx}`} className={classes.compactRow}>
                <TableCell className={classes.compactCell}>
                    <SbsFactCell
                        title={`Reference: ${fact.id}`}
                        zoomed={zoomedCurr}
                        body={fact.document_text_reference as string}
                        rowsMax={rowsMax}
                        backgroundColor="#b2d3c2"
                    />
                    {idx === 0 || idx === (currFacts?.data?.length ?? 0) - 1 ?
                        <FvBoundaryMarker hasComeIntoViewCb={(isInView: boolean) => {
                            console.info(`Facts: ${idx === 0 ? 'top' : 'bottom'} is in view`, isInView);

                            if (isInView && pagingState === 0) {
                                setPagingState(idx === 0 ? -1 : 1);
                            }
                        }} />
                        : null
                    }
                </TableCell>
                <TableCell className={classes.compactCell}>
                    <SbsFactCell
                        title={`Draft: ${fact.id}`}
                        zoomed={zoomedCurr}
                        body={(showUnformattedDraft ? fact.draft : fact.draft_unjsonified) as string}
                        rowsMax={rowsMax}
                        backgroundColor="floralwhite"
                    />
                </TableCell>
                <TableCell className={classes.compactCell2}>
                    <Box sx={{
                        padding: "0",
                        margin: "0",
                        whiteSpace: "nowrap",
                        borderRadius: "4px",
                        fontSize: "12px",
                        textAlign: "left",
                    }}>
                        <Box sx={{ padding: "0", margin: "0", display: "inline-flex", }}>
                            <SbsFactScorePicker fact={fact} isHorizontal={true} scoreChangeCb={scoreChangeCb} />
                        </Box>
                        <Box sx={{ padding: "0", display: "inline-flex", }}>
                            <SbsToggle
                                selected={zoomedCurr}
                                style={{
                                    cursor: 'pointer',
                                    position: 'relative',
                                    top: '8px',
                                    right: '-6px',
                                }}
                                clicktCb={(newValue: boolean, arg?: string | number) => {
                                    zoomCb(newValue ? arg as number : 0);

                                    if (newValue) {
                                        setBringIntoView(true);
                                    }
                                }}
                                clicktCbArg={fact.id}
                            >
                                <ZoomInIcon />
                            </SbsToggle>
                        </Box>
                    </Box>
                    {zoomedCurr ?
                        <>
                            <SbsFactScorePicker fact={fact} isHorizontal={false} scoreChangeCb={scoreChangeCb} />
                            <Box sx={{ padding: "24px 0 0", maxWidth: "360px" }}>
                                <ReviewTable data={fact} />
                            </Box>
                        </> : null
                    }
                </TableCell>
            </TableRow>
            <span ref={zoomRefEnd}></span>
        </>
    );
};
const SbsFacts = forwardRef((
    {
        height,
        showSessions,
        currFacts,
        currFactZoomed,
        currSessionZoomed,
        pagingState,
        setPagingState,
        scoreChangeCb,
        zoomed,
        zoomCb,
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
        scoreChangeCb: (id: number, scores: ISbsFactPutType) => void;
        zoomed: boolean;
        zoomCb: (id: number) => void;
        showUnformattedDraft: boolean;
        setShowUnformattedDraft: (newState: boolean) => void;
    }
    , ref: react.ForwardedRef<HTMLDivElement>
) => {
    const classes = useStyles();

    return (
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
                                    title={showUnformattedDraft ? "Show Unformatted Draft" : "Show Formatted Draft"}
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
                            <TableCell className={classes.compactCell2}>Controls</TableCell>
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
                            <SbsFactRow
                                key={`factRow${idx}`}
                                height={height}
                                currFacts={currFacts}
                                currFactZoomed={currFactZoomed}
                                pagingState={pagingState}
                                setPagingState={setPagingState}
                                scoreChangeCb={scoreChangeCb}
                                zoomCb={zoomCb}
                                fact={fact}
                                idx={idx}
                                showUnformattedDraft={showUnformattedDraft}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack >
    );
});

export default SbsFacts;