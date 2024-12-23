import FormatClearIcon from '@mui/icons-material/FormatClear';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { FormControl, InputLabel, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@material-ui/core";
import { ISbsFactPutType, ISbsFactType, ISbsSessionType, QueryResponseType } from "@foodvibes/utils/commonTypes";
import { Box, Stack, styled, width } from "@mui/system";
import FvBoundaryMarker from "./FvBoundaryMarker";
import react, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import SbsButton from './sbsButton';
import SbsToggle from './sbsToggle';
import SbsSliderButtons from './sbsSliderButtons';
import { KLineHeight, KScoreLableAc, KScoreLableAcShort, KScoreLableCl, KScoreLableClShort, KScoreLableCn, KScoreLableCnShort, KScoreLableCp, KScoreLableCpShort, KScoreLableCr, KScoreLableCrShort } from '@foodvibes/utils/commonConstants';
import { Button } from '@mui/material';

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
    overflow: 'auto',
});
const CompactTableCellHeader = styled(TableCell)({
    padding: '6px 8px 0',
    fontSize: '12px',
    verticalAlign: 'top',
    fontWeight: 'bold',
    backgroundColor: 'lavenderblush',
    zIndex: 1,
});
const CompactTableCell0 = styled(TableCell)({
    padding: '6px 8px 0',
    fontSize: '12px',
    verticalAlign: 'top',
    fontWeight: '100',
    fontStyle: 'italic',
    position: 'sticky',
    left: 0,
    background: '#fff', // Ensure the background is set to avoid overlap issues
    zIndex: 1, // Ensure it stays above other cells
});
const CompactTableCell = styled(TableCell)({
    padding: '6px 8px 0',
    fontSize: '12px',
    fontWeight: '100',
    verticalAlign: 'top',
    whiteSpace: "nowrap",
    overflow: "auto",
});
const CompactTableCellLong = styled(CompactTableCell)({
    whiteSpace: "wrap",
    maxHeight: "60px",
    minHeight: "20px",
    display: "block",
});
const ReviewTableRow = (
    {
        name,
        value,
        canEdit,
        editPropertyName,
        setEditPropertyName,
    }: {
        name: string;
        value: string;
        canEdit?: boolean;
        editPropertyName: string | null;
        setEditPropertyName: (newName: string | null) => void;
    }
) => {
    const label: string = useMemo(() => name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()), [name]);

    return (
        <>
            <CompactTableRow style={{ height: "36px" }}>
                <CompactTableCell0>
                    <>
                        {label}
                        {canEdit ?
                            <SbsToggle
                                selected={editPropertyName === name}
                                style={{
                                    cursor: 'pointer',
                                    position: 'absolute',
                                    top: '0px',
                                    right: '-6px',
                                    border: 0,
                                }}
                                clicktCb={(newValue: boolean, arg?: string | number) => {
                                    if (newValue) {
                                        setEditPropertyName(newValue ? arg as string : null);
                                    } else {
                                        setEditPropertyName(null);
                                    }
                                }}
                                clicktCbArg={name}
                                title='Edit'
                            >
                                <EditIcon />
                            </SbsToggle> :
                            null
                        }
                    </>
                </CompactTableCell0>
                <CompactTableCellLong>{value}</CompactTableCellLong>
            </CompactTableRow>
        </>
    );
};
const ReviewTable = (
    {
        fact,
        factPatchCb,
        editPropertyName,
        setEditPropertyName,
    }: {
        fact: ISbsFactType;
        factPatchCb: (id: number, payload: ISbsFactPutType) => void;
        editPropertyName: string | null;
        setEditPropertyName: (newName: string | null) => void;
    }
) => (
    <>
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <CompactTableRow>
                        <CompactTableCellHeader>Scores</CompactTableCellHeader>
                    </CompactTableRow>
                </TableHead>
                <TableBody>
                    <CompactTableRow>
                        <CompactTableCell>
                            <SbsFactScorePicker fact={fact} isHorizontal={false} factPatchCb={factPatchCb} />
                        </CompactTableCell>
                    </CompactTableRow>
                </TableBody>
            </Table>
        </TableContainer>
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <CompactTableRow>
                        <CompactTableCellHeader>Property</CompactTableCellHeader>
                        <CompactTableCellHeader>Value</CompactTableCellHeader>
                    </CompactTableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(fact).filter(([key, value]) =>
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
                            'draft',
                            'draft_unjsonified',
                        ].find(e => e === key)).map(([key, value]) => (
                            <ReviewTableRow
                                key={key}
                                name={key}
                                value={value as string}
                                canEdit={key === 'main_clause' || key === 'content' || key === 'explanation_completeness'}
                                editPropertyName={editPropertyName}
                                setEditPropertyName={setEditPropertyName}
                            />
                        ))}
                </TableBody>
            </Table>
        </TableContainer>
    </>
);
const SbsFactScorePicker = (
    {
        fact,
        isHorizontal,
        factPatchCb,
    }: {
        fact: ISbsFactType;
        isHorizontal: boolean;
        factPatchCb: (id: number, payload: ISbsFactPutType) => void;
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
                    factPatchCb(fact.id, {
                        property_name: config.scoreKey,
                        is_numeric: true,
                        property_value_numeric: value as number
                    } as ISbsFactPutType);
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
                    style: { fontSize: "12px", padding: "0", color: "black", backgroundColor, lineHeight: `${KLineHeight}px` },
                }}
                variant="standard"
                fullWidth
                classes={{ root: useStyles().customOutlinedInputRoot }}
                style={{ padding: "4px 8px", backgroundColor, }}
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
        factPatchCb,
        zoomCb,
        fact,
        idx,
        editPropertyName,
        setEditPropertyName,
        showUnformattedDraft,
    }: {
        height: number;
        currFacts: QueryResponseType<ISbsFactType>;
        currFactZoomed: QueryResponseType<ISbsFactType>;
        pagingState: number;
        setPagingState: (value: number) => void;
        factPatchCb: (id: number, payload: ISbsFactPutType) => void;
        zoomCb: (id: number) => void;
        fact: ISbsFactType;
        idx: number;
        editPropertyName: string | null;
        setEditPropertyName: (newName: string | null) => void;
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
                            <SbsFactScorePicker fact={fact} isHorizontal={true} factPatchCb={factPatchCb} />
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
                        <Box sx={{ padding: "12px 0 0", maxWidth: "360px" }}>
                            <ReviewTable
                                fact={fact}
                                factPatchCb={factPatchCb}
                                editPropertyName={editPropertyName}
                                setEditPropertyName={setEditPropertyName}
                            />
                        </Box> :
                        null
                    }
                </TableCell>
            </TableRow>
            <span ref={zoomRefEnd}></span>
        </>
    );
};
const ReviewTableCellEdit = (
    {
        name,
        label,
        value,
        changeCb,
    }: {
        name: string;
        label: string;
        value: string;
        changeCb: (value: string | null) => void;
    }
) => {
    const [textValue, setTextValue] = useState<string>(value);

    useEffect(() => {
        setTextValue(value);
    }, [name]);

    return (
        <Box sx={{
            display: "block",
            position: "absolute",
            width: "360px",
            height: "200px",
            bottom: "32px",
            right: "8px",
            margin: "0 auto",
            textAlign: "left",
            border: "1px solid black",
            padding: "0",
            overflow: "auto",
            backgroundColor: "white",
            color: "black",
            whiteSpace: "nowrap",
            borderRadius: "4px",
            fontSize: "12px",
            zIndex: 3,
        }}>
            <Box component="div" sx={{
                display: "flex",
                padding: "2px 6px",
                background: 'rgb(25, 118, 210)',
            }}>
                <Box component="span" sx={{
                    display: "flex",
                    float: "left",
                    width: "100%",
                    fontSize: '14px',
                    verticalAlign: 'top',
                    color: 'white',
                    lineHeight: '28px',

                }}>{label}</Box>
                <Box component="span" sx={{ display: "flex", float: "right", margin: "0" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={textValue === value}
                        sx={{
                            border: '1px solid white',
                            margin: '0 4px 0 0',
                            padding: '2px',
                            fontSize: '10px',
                            minWidth: 'auto',
                        }}
                        onClick={() => {
                            changeCb(textValue);
                        }}
                    ><SaveIcon /></Button>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{
                            border: '1px solid white',
                            padding: '2px',
                            fontSize: '10px',
                            minWidth: 'auto',
                        }}
                        onClick={() => {
                            changeCb(null);
                        }}
                    >{<CancelIcon />}</Button>
                </Box>
            </Box>
            <TextField
                id="outlined-editable-input"
                multiline
                minRows={4}
                maxRows={20}
                value={textValue}
                onChange={(e) => {
                    setTextValue(e.target.value);
                }}
                style={{
                    padding: "0",
                    border: "0",
                    width: '340px',
                    height: '162px',
                    maxHeight: '166px',
                    overflowY: 'hidden',
                    verticalAlign: "top",
                }}
                InputProps={{
                    style: {
                        display: "block",
                        verticalAlign: "top",
                        width: '340px',
                        height: '162px',
                        // overflowY: 'hidden',
                        fontSize: "12px",
                        padding: "6px",
                        // color: "black",
                        // lineHeight: `${KLineHeight}px`,
                    },
                }}
                variant="standard"
                fullWidth
            />
        </Box>
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
    const classes = useStyles();

    return (
        <>
            {editPropertyName?.length && currFactZoomed?.data?.[0]?.id ?
                <ReviewTableCellEdit
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
                                <SbsFactRow
                                    key={`factRow${idx}`}
                                    height={height}
                                    currFacts={currFacts}
                                    currFactZoomed={currFactZoomed}
                                    pagingState={pagingState}
                                    setPagingState={setPagingState}
                                    factPatchCb={factPatchCb}
                                    zoomCb={zoomCb}
                                    fact={fact}
                                    idx={idx}
                                    editPropertyName={editPropertyName}
                                    setEditPropertyName={setEditPropertyName}
                                    showUnformattedDraft={showUnformattedDraft}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack >
        </>
    );
});

export default SbsFacts;