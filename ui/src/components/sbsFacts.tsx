import { FormControl, InputLabel, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@material-ui/core";
import { ISbsFactType, ISbsSessionType, QueryResponseType } from "@foodvibes/utils/commonTypes";
import { Box, Stack } from "@mui/system";
import FvBoundaryMarker from "./FvBoundaryMarker";
import SbsSlider from "./sbsSlider";
import react, { forwardRef } from "react";

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
    },
    compactCell: {
        padding: '4px 8px',
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
const SbsSubFact = ({ title, body }: { title: string; body: string; }) =>
    <Box sx={{ margin: "6px 0 0", padding: "0px", border: "1px solid #ccc", borderRadius: "8px", }}>
        <FormControl fullWidth variant="outlined">
            <InputLabel
                shrink
                htmlFor="outlined-read-only-input"
                style={{ fontSize: "12px", color: "#1976d2", position: "relative", top: "7px", }}
            >
                {title}
            </InputLabel>
            <TextField
                id="outlined-read-only-input"
                multiline
                minRows={4}
                maxRows={4}
                defaultValue={body}
                InputProps={{
                    readOnly: true,
                    style: { fontSize: "12px", padding: "4px 8px", color: "black", backgroundColor: "floralwhite", },
                }}
                variant="standard"
                fullWidth
                classes={{ root: useStyles().customOutlinedInputRoot }}
            />
        </FormControl>
    </Box>;
const SbsFacts = forwardRef((
    {
        height,
        showSessions,
        currFacts,
        currSessionZoomed,
        pagingState,
        setPagingState,
        scoreChangeCb,
    }: {
        height: string;
        showSessions: () => void;
        currFacts: QueryResponseType<ISbsFactType>;
        currSessionZoomed: ISbsSessionType | undefined;
        pagingState: number;
        setPagingState: (value: number) => void;
        scoreChangeCb: (id: number, score: number) => void;
    }
    , ref: react.ForwardedRef<HTMLDivElement>) => {
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
            <Box sx={{ padding: "0 16px", backgroundColor: "lemonchiffon" }}>
                Session: <strong>{currSessionZoomed?.path}</strong>
                <button
                    style={{
                        float: 'right',
                        backgroundColor: '#cacaca',
                        color: 'black',
                        padding: '4px 8px',
                        border: '1px solid black',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    onClick={showSessions}
                >
                    Select Another Session To Review
                </button>
            </Box>
            <TableContainer component={Paper} className={classes.tableContainer} style={{ width: '100%', margin: 'auto', height, }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow className={classes.stickyHeader}>
                            <TableCell className={classes.compactCell}>Reference</TableCell>
                            <TableCell className={classes.compactCell}>Draft</TableCell>
                            <TableCell className={classes.compactCell}>Controls</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currFacts?.data?.map((fact: ISbsFactType, idx: number) => (
                            <TableRow key={`fact${idx}`} className={classes.compactRow}>
                                <TableCell className={classes.compactCell}>
                                    <>
                                        <SbsSubFact title={`Reference: ${fact.id}`} body={fact.document_text_reference as string} />
                                        {idx === 0 || idx === (currFacts?.data?.length ?? 0) - 1 ?
                                            <FvBoundaryMarker hasComeIntoViewCb={(isInView: boolean) => {
                                                console.info(`Facts: ${idx === 0 ? 'top' : 'bottom'} is in view`, isInView);

                                                if (isInView && pagingState === 0) {
                                                    setPagingState(idx === 0 ? -1 : 1);
                                                }
                                            }} />
                                            : null
                                        }
                                    </>
                                </TableCell>
                                <TableCell className={classes.compactCell}>
                                    <SbsSubFact title={`Draft: ${fact.id}`} body={fact.draft as string} />
                                </TableCell>
                                <TableCell className={classes.compactCell}>
                                    <SbsSlider
                                        label="Score"
                                        defaultValue={Number(fact.score) || 0}
                                        max={10} step={1} style={{ margin: "0px 8px", }} changeCb={(value) => {
                                            console.log("Slider value: ", value);

                                            if (scoreChangeCb) {
                                                scoreChangeCb(fact.id, value as number);
                                            }
                                        }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
});

export default SbsFacts;