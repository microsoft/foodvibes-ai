import FormatClearIcon from '@mui/icons-material/FormatClear';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { FormControl, InputLabel, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@material-ui/core";
import { ISbsFactPutType, ISbsFactType, ISbsSessionType, QueryResponseType } from "@sbssrc/utils/commonTypes";
import { Box, Stack, styled, width } from "@mui/system";
import SbsBoundaryMarker from "./sbsBoundaryMarker";
import react, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import SbsButton from './sbsButton';
import SbsToggle from './SbsToggle';
import SbsSliderButtons from './SbsSliderButtons';
import { KLineHeight, KScoreLableAc, KScoreLableAcShort, KScoreLableCl, KScoreLableClShort, KScoreLableCn, KScoreLableCnShort, KScoreLableCp, KScoreLableCpShort, KScoreLableCr, KScoreLableCrShort } from '@sbssrc/utils/commonConstants';
import { Button } from '@mui/material';
import SbsFactCellEdit from './SbsFactCellEdit';
import { CompactTableCell, CompactTableCell0, CompactTableCellHeader, CompactTableCellLong, CompactTableRow } from './SbsStyledCtls';
import SbsFactScorePicker from './SbsFactScorePicker';

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
                <CompactTableCellLong onDoubleClick={() => {
                    if (canEdit) {
                        setEditPropertyName(name);
                    }
                }}>{value}</CompactTableCellLong>
            </CompactTableRow>
        </>
    );
};
const sbsFactReviewTable = (
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
                    {Object.entries(fact).filter(([key]) =>
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

export default sbsFactReviewTable;