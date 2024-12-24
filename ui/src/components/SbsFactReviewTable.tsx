import EditIcon from '@mui/icons-material/Edit';
import { Paper, Table, TableBody, TableContainer, TableHead } from "@material-ui/core";
import { ISbsFactPutType, ISbsFactType } from "@sbssrc/utils/commonTypes";
import { useMemo } from "react";
import SbsToggle from './SbsToggle';
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