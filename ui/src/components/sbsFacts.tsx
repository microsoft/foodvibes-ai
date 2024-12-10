import ZoomInIcon from '@material-ui/icons/ZoomIn';
import { FormControl, InputLabel, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
import { ISbsFactType, ISbsSessionType, QueryResponseType } from "@foodvibes/utils/commonTypes";
import { Box, Stack, styled } from "@mui/system";
import FvBoundaryMarker from "./FvBoundaryMarker";
import SbsSlider from "./sbsSlider";
import react, { forwardRef, useEffect, useRef, useState } from "react";
import SbsButton from './sbsButton';
import SbsToggle from './sbsToggle';

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
                    !['id', 'session_id', 'score', 'document_text_reference', 'draft'].find(e => e === key)).map(([key, value]) => (
                        <CompactTableRow key={key} style={{ height: "36px" }}>
                            <CompactTableCell0>{key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</CompactTableCell0>
                            <CompactTableCell>{value}</CompactTableCell>
                        </CompactTableRow>
                    ))}
            </TableBody>
        </Table>
    </TableContainer>
);
const SbsSubFact = forwardRef((
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
    , ref: react.ForwardedRef<HTMLDivElement>
) =>
    <Box sx={{ margin: "6px 0 0", padding: "0px", border: "1px solid #ccc", borderRadius: "8px", }}>
        <FormControl fullWidth variant="outlined">
            <InputLabel
                shrink
                htmlFor="outlined-read-only-input"
                style={{ fontSize: "12px", color: "#1976d2", position: "relative", top: "7px", }}
            >
                {title} -- Chars. {body?.length}{zoomed ? "" : " truncated"}
            </InputLabel>
            <TextField
                ref={ref}
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
);
const isZoomed = (factId: number, currFactZoomed: QueryResponseType<ISbsFactType>): boolean =>
    factId && factId === currFactZoomed?.data?.[0].id ? true : false;
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
    }: {
        height: number;
        showSessions: () => void;
        currFacts: QueryResponseType<ISbsFactType>;
        currFactZoomed: QueryResponseType<ISbsFactType>;
        currSessionZoomed: ISbsSessionType | undefined;
        pagingState: number;
        setPagingState: (value: number) => void;
        scoreChangeCb: (id: number, score: number) => void;
        zoomed: boolean;
        zoomCb: (id: number) => void;
    }
    , ref: react.ForwardedRef<HTMLDivElement>
) => {
    const classes = useStyles();
    const [rowsMax, setRowsMax] = useState<number>(4);
    const zoomRef = useRef<HTMLTableRowElement>(null);
    useEffect(() => {
        setRowsMax(Math.floor((height - 200) / KLineHeight));
    }, [height]);

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
                Session: <strong>{currSessionZoomed?.path}</strong>
                <SbsButton caption="View Session List" style={{ float: "right" }} clicktCb={showSessions} />
            </Box>
            <TableContainer component={Paper} className={classes.tableContainer} style={{ width: '100%', margin: 'auto', height: `${height}px`, }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow className={classes.stickyHeader}>
                            <TableCell className={classes.compactCell}>Reference</TableCell>
                            <TableCell className={classes.compactCell}>Draft</TableCell>
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
                                }) : fact
                        )))?.map((fact: ISbsFactType, idx: number) => (
                            <TableRow key={`fact${idx}`} className={classes.compactRow}>
                                <TableCell className={classes.compactCell}>
                                    <SbsSubFact
                                        ref={isZoomed(fact.id, currFactZoomed) ? zoomRef : null}
                                        title={`Reference: ${fact.id}`}
                                        zoomed={isZoomed(fact.id, currFactZoomed)}
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
                                    <SbsSubFact
                                        title={`Draft: ${fact.id}`}
                                        zoomed={isZoomed(fact.id, currFactZoomed)}
                                        body={fact.draft as string}
                                        rowsMax={rowsMax}
                                        backgroundColor="floralwhite"
                                    />
                                </TableCell>
                                <TableCell className={classes.compactCell2}>
                                    <Box>
                                        <Typography
                                            id="slider-label"
                                            gutterBottom
                                            style={{
                                                backgroundColor: "lavenderblush",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                margin: "0",
                                                width: "96%",
                                                height: "30px",
                                                textAlign: "left",
                                                padding: "6px 0 0 8px",
                                            }}>
                                            Score
                                            <SbsToggle
                                                selected={isZoomed(fact.id, currFactZoomed)}
                                                style={{
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    top: '-4px',
                                                    right: '4px',
                                                    float: 'right',
                                                }}
                                                clicktCb={(newValue: boolean, arg?: string | number) => {
                                                    if (newValue) {
                                                        zoomCb(arg as number);

                                                        // if (zoomRef.current) {
                                                        //     zoomRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                                                        // }
                                                    } else {
                                                        zoomCb(0);
                                                    }
                                                }}
                                                clicktCbArg={fact.id}
                                            >
                                                <ZoomInIcon />
                                            </SbsToggle>
                                        </Typography>
                                    </Box>
                                    <SbsSlider
                                        defaultValue={Number(fact.score) || 0}
                                        max={10} step={1} style={{ margin: "0px 8px", }} changeCb={(value) => {
                                            console.log("Slider value: ", value);

                                            if (scoreChangeCb) {
                                                scoreChangeCb(fact.id, value as number);
                                            }
                                        }}
                                    />
                                    {isZoomed(fact.id, currFactZoomed) ?
                                        <Box sx={{ padding: "24px 0 0", maxWidth: "360px" }}>
                                            <ReviewTable data={fact} />
                                        </Box> : null
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack >
    );
});

export default SbsFacts;