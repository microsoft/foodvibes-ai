import ZoomInIcon from '@material-ui/icons/ZoomIn';
import { FormControl, InputLabel, TableCell, TableRow, TextField } from "@material-ui/core";
import { ISbsFactPutType, ISbsFactType, QueryResponseType } from "@sbssrc/utils/commonTypes";
import { Box } from "@mui/system";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import SbsToggle from './SbsToggle';
import { KLineHeight } from '@sbssrc/utils/commonConstants';
import SbsFactScorePicker from './SbsFactScorePicker';
import SbsFactReviewTable from './SbsFactReviewTable';
import { UseSbsStyles } from './SbsStyledCtls';

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
                classes={{ root: UseSbsStyles().customOutlinedInputRoot }}
                style={{ padding: "4px 8px", backgroundColor, }}
            />
        </FormControl>
    </Box>
    ;
const SbsFactRow = forwardRef((
    {
        height,
        currFactZoomed,
        factPatchCb,
        zoomCb,
        fact,
        idx,
        editPropertyName,
        setEditPropertyName,
        showUnformattedDraft,
        bringIntoViewCb,
    }: {
        height: number;
        currFactZoomed: QueryResponseType<ISbsFactType>;
        factPatchCb: (id: number, payload: ISbsFactPutType) => void;
        zoomCb: (id: number) => void;
        fact: ISbsFactType;
        idx: number;
        editPropertyName: string | null;
        setEditPropertyName: (newName: string | null) => void;
        showUnformattedDraft: boolean;
        bringIntoViewCb: (idx: number) => void;
    }
    , ref: React.ForwardedRef<HTMLTableRowElement>
) => {
    const classes = UseSbsStyles();
    const rowsMax: number = useMemo(() => Math.floor((height - 200) / KLineHeight), [height]);
    const zoomedCurr: boolean = useMemo(() => fact.id && fact.id === currFactZoomed?.data?.[0].id ? true : false, [fact.id, currFactZoomed?.data?.[0].id]);

    return (
        <>
            <TableRow key={`fact${idx}`} ref={ref} className={classes.compactRow}>
                <TableCell className={classes.compactCell}>
                    <SbsFactCell
                        title={`Reference: ${fact.id}`}
                        zoomed={zoomedCurr}
                        body={fact.document_text_reference as string}
                        rowsMax={rowsMax}
                        backgroundColor="#b2d3c2"
                    />
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
                                        bringIntoViewCb(idx);
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
                            <SbsFactReviewTable
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
        </>
    );
});

export default SbsFactRow;